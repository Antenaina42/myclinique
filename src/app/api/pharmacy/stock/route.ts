import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction, StockExitReason } from '@prisma/client';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const [entries, exits] = await Promise.all([
      prisma.stockEntry.findMany({
        where: { medicine: { clinicId: session.clinicId } },
        include: {
          medicine: true,
          supplier: true,
        },
        orderBy: { entryDate: 'desc' },
        take: 50,
      }),
      prisma.stockExit.findMany({
        where: { medicine: { clinicId: session.clinicId } },
        include: {
          medicine: true,
        },
        orderBy: { exitDate: 'desc' },
        take: 50,
      }),
    ]);

    return NextResponse.json({ entries, exits });
  } catch (error) {
    console.error('Fetch stock movements error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, medicineId, supplierId, quantity, unitCost, batchNumber, expiryDate, reason, notes } = body;

    const qty = parseInt(quantity, 10);
    if (!medicineId || !qty || qty <= 0) {
      return NextResponse.json({ error: 'Médicament et quantité valide requis.' }, { status: 400 });
    }

    if (type === 'ENTRY') {
      const cost = parseFloat(unitCost || '0');
      const [entry, updatedMed] = await prisma.$transaction([
        prisma.stockEntry.create({
          data: {
            medicineId,
            supplierId: supplierId || null,
            quantity: qty,
            unitCost: cost,
            totalCost: cost * qty,
            batchNumber: batchNumber || null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            notes: notes || null,
            createdById: session.id,
          },
          include: { medicine: true },
        }),
        prisma.medicine.update({
          where: { id: medicineId },
          data: {
            currentStock: { increment: qty },
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          },
        }),
      ]);

      await logAuditAction({
        clinicId: session.clinicId,
        userId: session.id,
        action: AuditAction.UPDATE,
        entity: 'MedicineStock',
        entityId: medicineId,
        details: `Entrée de stock : +${qty} ${updatedMed.name} (Lot: ${batchNumber || 'N/A'})`,
      });

      return NextResponse.json({ success: true, entry });
    } else if (type === 'EXIT') {
      const med = await prisma.medicine.findUnique({ where: { id: medicineId } });
      if (!med || med.currentStock < qty) {
        return NextResponse.json(
          { error: `Stock insuffisant pour effectuer cette sortie. Stock actuel : ${med?.currentStock || 0}` },
          { status: 400 }
        );
      }

      const [exit, updatedMed] = await prisma.$transaction([
        prisma.stockExit.create({
          data: {
            medicineId,
            quantity: qty,
            reason: (reason as StockExitReason) || StockExitReason.EXPIRED,
            notes: notes || null,
            createdById: session.id,
          },
          include: { medicine: true },
        }),
        prisma.medicine.update({
          where: { id: medicineId },
          data: {
            currentStock: { decrement: qty },
          },
        }),
      ]);

      await logAuditAction({
        clinicId: session.clinicId,
        userId: session.id,
        action: AuditAction.UPDATE,
        entity: 'MedicineStock',
        entityId: medicineId,
        details: `Sortie de stock : -${qty} ${updatedMed.name} (Motif: ${reason})`,
      });

      return NextResponse.json({ success: true, exit });
    }

    return NextResponse.json({ error: 'Type de mouvement invalide' }, { status: 400 });
  } catch (error: any) {
    console.error('Stock operation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du mouvement de stock : ' + error.message },
      { status: 500 }
    );
  }
}
