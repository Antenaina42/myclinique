import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction, InvoiceItemType, InvoiceStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const whereClause: any = {
      clinicId: session.clinicId,
    };
    if (status) {
      whereClause.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        patient: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Fetch invoices error:', error);
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
    const { patientId, consultationId, items, discountAmount, notes } = body;

    if (!patientId || !items || !items.length) {
      return NextResponse.json(
        { error: 'Patient et au moins une ligne de facturation sont obligatoires.' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, it: any) => sum + (parseFloat(it.unitPrice) * parseInt(it.quantity, 10)),
      0
    );
    const discount = parseFloat(discountAmount || '0');
    const totalAmount = Math.max(0, subtotal - discount);

    const currentYear = new Date().getFullYear();
    const count = await prisma.invoice.count({ where: { clinicId: session.clinicId } });
    const invoiceNumber = `FAC-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        clinicId: session.clinicId,
        invoiceNumber,
        patientId,
        consultationId: consultationId || null,
        totalAmount,
        discountAmount: discount,
        paidAmount: 0,
        balance: totalAmount,
        status: InvoiceStatus.UNPAID,
        notes: notes || null,
        items: {
          create: items.map((it: any) => ({
            description: it.description,
            itemType: (it.itemType as InvoiceItemType) || InvoiceItemType.CONSULTATION,
            quantity: parseInt(it.quantity, 10),
            unitPrice: parseFloat(it.unitPrice),
            totalPrice: parseFloat(it.unitPrice) * parseInt(it.quantity, 10),
          })),
        },
      },
      include: {
        patient: true,
        items: true,
      },
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.CREATE,
      entity: 'Invoice',
      entityId: invoice.id,
      details: `Facture ${invoice.invoiceNumber} émise pour ${invoice.patient.lastName} (${totalAmount} Ar)`,
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la facture : ' + error.message },
      { status: 500 }
    );
  }
}
