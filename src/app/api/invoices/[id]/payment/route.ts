import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction, CashTransactionType, InvoiceStatus, PaymentMethod } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const invoiceId = params.id;
    const body = await request.json();
    const { amount, paymentMethod, reference, notes } = body;

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ error: 'Montant de paiement invalide' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { patient: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    const newPaidAmount = invoice.paidAmount + paymentAmount;
    const newBalance = Math.max(0, invoice.totalAmount - invoice.discountAmount - newPaidAmount);
    const newStatus =
      newBalance === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    // Numéro de paiement unique PAY-2026-XXXX
    const count = await prisma.payment.count();
    const currentYear = new Date().getFullYear();
    const paymentNumber = `PAY-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    // Enregistrement du paiement et mise à jour de la facture en transaction atomique
    const [payment, updatedInvoice] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          paymentNumber,
          invoiceId: invoice.id,
          amount: paymentAmount,
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          reference: reference || null,
          notes: notes || null,
          receivedById: session.id,
        },
      }),
      prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: newStatus,
        },
      }),
      prisma.cashTransaction.create({
        data: {
          clinicId: session.clinicId,
          type: CashTransactionType.INCOME,
          category: 'Règlement Facture',
          amount: paymentAmount,
          paymentMethod: (paymentMethod as PaymentMethod) || PaymentMethod.CASH,
          reference: invoice.invoiceNumber,
          description: `Règlement facture ${invoice.invoiceNumber} (${invoice.patient.lastName})`,
          performedById: session.id,
        },
      }),
    ]);

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.PAYMENT,
      entity: 'Invoice',
      entityId: invoice.id,
      details: `Paiement de ${paymentAmount} Ar enregistré pour la facture ${invoice.invoiceNumber}. Nouveau solde : ${newBalance} Ar`,
    });

    return NextResponse.json({ success: true, payment, invoice: updatedInvoice });
  } catch (error: any) {
    console.error('Record payment error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l’enregistrement du paiement : ' + error.message },
      { status: 500 }
    );
  }
}
