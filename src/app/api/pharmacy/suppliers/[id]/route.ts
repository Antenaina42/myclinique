import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { id } = params;

  try {
    const existing = await prisma.supplier.findFirst({
      where: { id, clinicId: session.clinicId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Fournisseur introuvable' }, { status: 404 });
    }

    const body = await request.json();
    const { name, contactPerson, phone, email, address, taxId, notes } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom du fournisseur est obligatoire.' }, { status: 400 });
    }

    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Le numéro de téléphone est obligatoire.' }, { status: 400 });
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
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
      action: AuditAction.UPDATE,
      entity: 'Supplier',
      entityId: updated.id,
      details: `Mise à jour du fournisseur ${updated.name}`,
    });

    return NextResponse.json({ success: true, supplier: updated });
  } catch (error: any) {
    console.error('Update supplier error:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification : ' + error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { id } = params;

  try {
    const existing = await prisma.supplier.findFirst({
      where: { id, clinicId: session.clinicId },
      include: {
        _count: { select: { stockEntries: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Fournisseur introuvable' }, { status: 404 });
    }

    // Safety check: Don't delete if stock entries are linked
    if (existing._count.stockEntries > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer ce fournisseur car ${existing._count.stockEntries} entrée(s) de stock y sont associées. Vous pouvez modifier ses informations mais pas le supprimer afin de garantir l'historique comptable et médical.`,
        },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.DELETE,
      entity: 'Supplier',
      entityId: id,
      details: `Suppression du fournisseur ${existing.name}`,
    });

    return NextResponse.json({ success: true, message: 'Fournisseur supprimé avec succès' });
  } catch (error: any) {
    console.error('Delete supplier error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression : ' + error.message }, { status: 500 });
  }
}
