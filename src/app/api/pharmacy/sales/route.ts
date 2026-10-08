import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction, CashTransactionType, PaymentMethod, SaleStatus } from '@prisma/client';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const sales = await prisma.pharmacySale.findMany({
      where: { clinicId: session.clinicId },
      include: {
        items: {
          include: { medicine: true },
        },
        patient: true,
      },
      orderBy: { saleDate: 'desc' },
      take: 50,
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Fetch sales error:', error);
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
    const {
      prescriptionId,
      patientId,
      customerName,
      customerPhone,
      items,
      paymentMethod,
      paymentReference,
      discount,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'Le panier ne contient aucun médicament.' },
        { status: 400 }
      );
    }

    // 1. Vérification stricte des stocks disponibles en base
    const medicineIds = items.map((i: any) => i.medicineId);
    const dbMedicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
    });
    const medMap = new Map(dbMedicines.map((m) => [m.id, m]));

    for (const item of items) {
      const dbMed = medMap.get(item.medicineId);
      if (!dbMed) {
        return NextResponse.json(
          { error: `Médicament introuvable : ${item.name}` },
          { status: 400 }
        );
      }
      if (dbMed.currentStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour "${dbMed.name}". Stock disponible : ${dbMed.currentStock}, Quantité demandée : ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Calcul montants
    const subtotal = items.reduce(
      (sum: number, it: any) => sum + (it.unitPrice * it.quantity),
      0
    );
    const disc = parseFloat(discount || '0');
    const total = Math.max(0, subtotal - disc);

    // Numéro de vente VTE-2026-XXXX
    const count = await prisma.pharmacySale.count({ where: { clinicId: session.clinicId } });
    const currentYear = new Date().getFullYear();
    const saleNumber = `VTE-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    // Transaction atomique : création vente + décrémentation stock + caisse
    const sale = await prisma.$transaction(async (tx) => {
      // Décrémenter chaque médicament
      for (const item of items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Créer la vente
      const createdSale = await tx.pharmacySale.create({
        data: {
          saleNumber,
          clinicId: session.clinicId,
          prescriptionId: prescriptionId || null,
          patientId: patientId || null,
          customerName: customerName || 'Client de passage',
          customerPhone: customerPhone || null,
          subtotal,
          discount: disc,
          total,
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          paymentReference: paymentReference || null,
          status: SaleStatus.COMPLETED,
          cashierId: session.id,
          items: {
            create: items.map((it: any) => ({
              medicineId: it.medicineId,
              medicineName: it.name,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              totalPrice: it.unitPrice * it.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Enregistrer dans la caisse
      await tx.cashTransaction.create({
        data: {
          clinicId: session.clinicId,
          type: CashTransactionType.INCOME,
          category: 'Pharmacie',
          amount: total,
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          reference: saleNumber,
          description: `Vente pharmacie comptoir ${saleNumber} (${customerName || 'Client'})`,
          performedById: session.id,
        },
      });

      return createdSale;
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.DISPENSE,
      entity: 'PharmacySale',
      entityId: sale.id,
      details: `Vente pharmacie ${sale.saleNumber} effectuée pour un montant de ${total} Ar. Stock déduit automatiquement.`,
    });

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error: any) {
    console.error('Pharmacy sale error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vente pharmacie : ' + error.message },
      { status: 500 }
    );
  }
}
