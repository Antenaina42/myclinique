import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const suppliers = await prisma.supplier.findMany({
      where: { clinicId: session.clinicId },
      include: {
        _count: { select: { stockEntries: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error('Fetch suppliers error:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des fournisseurs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, contactPerson, phone, email, address, taxId, notes } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom du fournisseur est obligatoire.' }, { status: 400 });
    }

    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Le numéro de téléphone est obligatoire.' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        clinicId: session.clinicId,
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        phone: phone.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        taxId: taxId?.trim() || null,
        notes: notes?.trim() || null,
      },
      include: {
        _count: { select: { stockEntries: true } },
      },
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.CREATE,
      entity: 'Supplier',
      entityId: supplier.id,
      details: `Création du fournisseur pharmaceutique ${supplier.name} (${supplier.phone})`,
    });

    return NextResponse.json({ success: true, supplier }, { status: 201 });
  } catch (error: any) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du fournisseur : ' + error.message }, { status: 500 });
  }
}
