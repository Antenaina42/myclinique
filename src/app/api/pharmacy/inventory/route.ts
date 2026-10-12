import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction, StockExitReason } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status'); // 'low', 'out', 'expiring', 'expired'

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const whereClause: any = {
      clinicId: session.clinicId,
      isActive: true,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (status === 'out') {
      whereClause.currentStock = 0;
    } else if (status === 'low') {
      whereClause.currentStock = { gt: 0, lte: 15 };
    } else if (status === 'expired') {
      whereClause.expiryDate = { lte: now };
    } else if (status === 'expiring') {
      whereClause.expiryDate = { gt: now, lte: in30Days };
    }

    const medicines = await prisma.medicine.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      medicines,
    });
  } catch (error: any) {
    console.error('Inventory GET error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données d’inventaire', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Seuls Administrateurs et Pharmaciens peuvent valider un ajustement d'inventaire
    if (!['SUPER_ADMIN', 'CLINIC_ADMIN', 'PHARMACIST'].includes(session.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { adjustments, notes } = body; // Array of { medicineId, physicalStock, reason }

    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return NextResponse.json({ error: 'Aucun ajustement fourni' }, { status: 400 });
    }

    const results = await prisma.$transaction(async (tx) => {
      const updatedList = [];

      for (const adj of adjustments) {
        const { medicineId, physicalStock, note } = adj;
        const currentMed = await tx.medicine.findUnique({
          where: { id: medicineId },
        });

        if (!currentMed || currentMed.clinicId !== session.clinicId) {
          continue;
        }

        const theoreticalStock = currentMed.currentStock;
        const diff = Number(physicalStock) - theoreticalStock;

        if (diff === 0) {
          continue; // Pas de variation
        }

        // Mettre à jour le stock actuel
        const updatedMed = await tx.medicine.update({
          where: { id: medicineId },
          data: { currentStock: Number(physicalStock) },
          include: { category: true },
        });

        const justification = note || notes || `Inventaire physique : ${theoreticalStock} -> ${physicalStock} (${diff > 0 ? '+' : ''}${diff})`;

        if (diff < 0) {
          // Déficit (perte, casse, vol, périmé non déclaré) -> Sortie de stock
          await tx.stockExit.create({
            data: {
              medicineId,
              quantity: Math.abs(diff),
              reason: StockExitReason.INVENTORY_ADJUSTMENT,
              notes: justification,
              createdById: session.id,
            },
          });
        } else {
          // Excédent (surplus compté) -> Entrée de stock
          await tx.stockEntry.create({
            data: {
              medicineId,
              quantity: diff,
              unitCost: currentMed.purchasePrice,
              totalCost: diff * currentMed.purchasePrice,
              notes: justification,
              createdById: session.id,
            },
          });
        }

        updatedList.push({
          id: medicineId,
          name: updatedMed.name,
          oldStock: theoreticalStock,
          newStock: physicalStock,
          diff,
        });
      }

      return updatedList;
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.UPDATE,
      entity: 'Inventory',
      entityId: session.clinicId,
      details: `Ajustement d'inventaire pharmacie par ${session.firstName} ${session.lastName} (${results.length} référence(s) ajustée(s))`,
    });

    return NextResponse.json({
      success: true,
      message: `${results.length} référence(s) ajustée(s) avec succès`,
      results,
    });
  } catch (error: any) {
    console.error('Inventory POST adjustment error:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajustement d'inventaire", details: error.message },
      { status: 500 }
    );
  }
}
