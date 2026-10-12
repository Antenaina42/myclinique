import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const rx = await prisma.prescription.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            specialty: { select: { name: true } },
          },
        },
        items: true,
      },
    });

    if (!rx) {
      return NextResponse.json({ error: 'Ordonnance introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, prescription: rx });
  } catch (error: any) {
    console.error('Get prescription error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l’ordonnance' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { doctorNotes, status, resultsPhotos, resultsStatus, resultsDate, resultsNotes } = body;

    const existingRx = await prisma.prescription.findUnique({
      where: { id: params.id },
    });

    if (!existingRx) {
      return NextResponse.json({ error: 'Ordonnance introuvable' }, { status: 404 });
    }

    // Merge metadata into doctorNotes if results updates provided
    let updatedNotes = doctorNotes !== undefined ? doctorNotes : existingRx.doctorNotes;

    if (resultsPhotos !== undefined || resultsStatus !== undefined || resultsDate !== undefined || resultsNotes !== undefined) {
      let meta: any = {};
      try {
        if (existingRx.doctorNotes && existingRx.doctorNotes.startsWith('{')) {
          meta = JSON.parse(existingRx.doctorNotes);
        } else if (existingRx.doctorNotes) {
          meta = { notes: existingRx.doctorNotes };
        }
      } catch {
        meta = { notes: existingRx.doctorNotes };
      }

      if (resultsPhotos !== undefined) meta.resultsPhotos = resultsPhotos;
      if (resultsStatus !== undefined) meta.resultsStatus = resultsStatus;
      if (resultsDate !== undefined) meta.resultsDate = resultsDate;
      if (resultsNotes !== undefined) meta.resultsNotes = resultsNotes;

      updatedNotes = JSON.stringify(meta);
    }

    const updatedRx = await prisma.prescription.update({
      where: { id: params.id },
      data: {
        ...(updatedNotes !== undefined ? { doctorNotes: updatedNotes } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            specialty: { select: { name: true } },
          },
        },
        items: true,
      },
    });

    return NextResponse.json({ success: true, prescription: updatedRx });
  } catch (error: any) {
    console.error('Update prescription error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l’ordonnance' },
      { status: 500 }
    );
  }
}
