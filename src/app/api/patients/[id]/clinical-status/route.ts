import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  parseClinicalMetadata,
  serializeClinicalMetadata,
  ClinicalMetadata,
} from '@/lib/clinicalMetadata';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { patientId: params.id },
    });

    const clinicalData = parseClinicalMetadata(medicalRecord?.generalNotes);
    return NextResponse.json({ success: true, data: clinicalData });
  } catch (error: any) {
    console.error('Get clinical status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données cliniques' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      clinicalStatus,
      clinicalStatusDate,
      deathDate,
      deathCause,
      treatmentResultNotes,
      hospitalizations,
      notes,
    } = body;

    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { patientId: params.id },
    });

    const serialized = serializeClinicalMetadata(
      {
        clinicalStatus,
        clinicalStatusDate,
        deathDate,
        deathCause,
        treatmentResultNotes,
        hospitalizations,
        ...(notes !== undefined ? { notes } : {}),
      },
      existingRecord?.generalNotes
    );

    const updatedRecord = await prisma.medicalRecord.upsert({
      where: { patientId: params.id },
      create: {
        patientId: params.id,
        generalNotes: serialized,
      },
      update: {
        generalNotes: serialized,
      },
    });

    const parsed = parseClinicalMetadata(updatedRecord.generalNotes);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Update clinical status error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour des données cliniques' },
      { status: 500 }
    );
  }
}
