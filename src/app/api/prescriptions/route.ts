import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient: { clinicId: session.clinicId },
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            specialty: { select: { name: true } },
          },
        },
        items: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Fetch prescriptions error:', error);
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
    const { patientId, doctorId, consultationId, doctorNotes, items } = body;

    if (!patientId || !doctorId || !items || !items.length) {
      return NextResponse.json(
        { error: 'Patient, Médecin et au moins un médicament sont obligatoires.' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    const count = await prisma.prescription.count({
      where: { patient: { clinicId: session.clinicId } },
    });
    const prescriptionNumber = `ORD-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNumber,
        patientId,
        doctorId,
        consultationId: consultationId || null,
        doctorNotes: doctorNotes || null,
        qrCode: `https://myclinique.mg/verify/rx/${prescriptionNumber}`,
        validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000), // Valable 30 jours
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId || null,
            medicineName: item.medicineName,
            dosage: item.dosage || 'Standard',
            form: item.form || 'Comprimé',
            quantity: parseInt(item.quantity || '1', 10),
            frequency: item.frequency || '1 fois par jour',
            duration: item.duration || 'Pendant 5 jours',
            route: item.route || 'Voie orale',
            instructions: item.instructions || null,
          })),
        },
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
            specialty: true,
          },
        },
        items: true,
      },
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.CREATE,
      entity: 'Prescription',
      entityId: prescription.id,
      details: `Ordonnance ${prescription.prescriptionNumber} délivrée à ${prescription.patient.lastName} ${prescription.patient.firstName}`,
    });

    return NextResponse.json({ success: true, prescription }, { status: 201 });
  } catch (error: any) {
    console.error('Create prescription error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l’ordonnance : ' + error.message },
      { status: 500 }
    );
  }
}
