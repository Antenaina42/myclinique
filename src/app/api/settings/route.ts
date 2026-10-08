import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, setSessionCookie } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      include: {
        settings: true,
      },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinique non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ clinic, settings: clinic.settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des paramètres' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Only Admin can modify clinic settings
  if (session.role !== 'SUPER_ADMIN' && session.role !== 'CLINIC_ADMIN') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slogan,
      address,
      phone,
      email,
      website,
      taxId,
      currency,
      dateFormat,
      timeZone,
      customSettings,
    } = body;

    const updatedClinic = await prisma.$transaction(async (tx) => {
      const c = await tx.clinic.update({
        where: { id: session.clinicId },
        data: {
          name: name ?? undefined,
          slogan: slogan ?? undefined,
          address: address ?? undefined,
          phone: phone ?? undefined,
          email: email ?? undefined,
          website: website ?? undefined,
          taxId: taxId ?? undefined,
          currency: currency ?? undefined,
          dateFormat: dateFormat ?? undefined,
          timeZone: timeZone ?? undefined,
        },
      });

      if (customSettings && typeof customSettings === 'object') {
        for (const [key, value] of Object.entries(customSettings)) {
          if (typeof value === 'string') {
            await tx.setting.upsert({
              where: {
                clinicId_key: {
                  clinicId: session.clinicId,
                  key,
                },
              },
              create: {
                clinicId: session.clinicId,
                key,
                value,
                category: 'custom',
              },
              update: {
                value,
              },
            });
          }
        }
      }

      return c;
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.UPDATE,
      entity: 'Clinic',
      entityId: session.clinicId,
      details: `Modification des paramètres de la clinique "${updatedClinic.name}"`,
    });

    await setSessionCookie({
      ...session,
      clinicName: updatedClinic.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      clinic: updatedClinic,
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la mise à jour des paramètres' }, { status: 500 });
  }
}
