import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateInvoicePDF } from '@/lib/pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        clinic: true,
        patient: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    }

    const doc = generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      issuedDate: invoice.issuedDate,
      status: invoice.status,
      clinic: {
        name: invoice.clinic.name,
        address: invoice.clinic.address || 'Antananarivo, Madagascar',
        phone: invoice.clinic.phone || '+261 20 22 123 45',
        email: invoice.clinic.email || 'contact@myclinique.mg',
        taxId: invoice.clinic.taxId || 'NIF/STAT',
        currency: invoice.clinic.currency,
      },
      patient: {
        name: `${invoice.patient.lastName} ${invoice.patient.firstName}`,
        patientNumber: invoice.patient.patientNumber,
        phone: invoice.patient.phone,
        address: invoice.patient.address || undefined,
      },
      items: invoice.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
      totalAmount: invoice.totalAmount,
      discountAmount: invoice.discountAmount,
      taxAmount: invoice.taxAmount,
      paidAmount: invoice.paidAmount,
      balance: invoice.balance,
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Invoice PDF error:', error);
    return NextResponse.json({ error: 'Erreur génération PDF facture' }, { status: 500 });
  }
}
