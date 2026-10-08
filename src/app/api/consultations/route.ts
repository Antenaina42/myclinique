import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction, AppointmentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const consultations = await prisma.consultation.findMany({
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
        vitalSigns: true,
        prescription: true,
        invoice: true,
      },
      orderBy: { consultationDate: 'desc' },
      take: 50,
    });

    return NextResponse.json(consultations);
  } catch (error) {
    console.error('Fetch consultations error:', error);
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
      patientId,
      doctorId,
      appointmentId,
      reason,
      symptoms,
      physicalExamination,
      diagnosis,
      treatment,
      doctorNotes,
      vitals,
    } = body;

    if (!patientId || !doctorId || !reason) {
      return NextResponse.json(
        { error: 'Patient, Médecin et Motif de consultation sont obligatoires.' },
        { status: 400 }
      );
    }

    // Calcul IMC automatique si poids et taille fournis
    let bmi: number | null = null;
    if (vitals?.weight && vitals?.height && vitals.height > 0) {
      const hM = vitals.height / 100;
      bmi = parseFloat((vitals.weight / (hM * hM)).toFixed(1));
    }

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        reason,
        symptoms: symptoms || null,
        physicalExamination: physicalExamination || null,
        diagnosis: diagnosis || null,
        treatment: treatment || null,
        doctorNotes: doctorNotes || null,
        status: 'COMPLETED',
        vitalSigns: vitals
          ? {
              create: {
                temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
                systolicBP: vitals.systolicBP ? parseInt(vitals.systolicBP, 10) : null,
                diastolicBP: vitals.diastolicBP ? parseInt(vitals.diastolicBP, 10) : null,
                heartRate: vitals.heartRate ? parseInt(vitals.heartRate, 10) : null,
                oxygenSaturation: vitals.oxygenSaturation ? parseFloat(vitals.oxygenSaturation) : null,
                weight: vitals.weight ? parseFloat(vitals.weight) : null,
                height: vitals.height ? parseFloat(vitals.height) : null,
                bmi,
              },
            }
          : undefined,
      },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
            specialty: true,
          },
        },
        vitalSigns: true,
      },
    });

    // Si un RDV était associé, le marquer comme COMPLETED
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });
    }

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.CREATE,
      entity: 'Consultation',
      entityId: consultation.id,
      details: `Consultation réalisée pour ${consultation.patient.lastName} ${consultation.patient.firstName} par Dr. ${consultation.doctor.user.lastName}`,
    });

    return NextResponse.json({ success: true, consultation }, { status: 201 });
  } catch (error: any) {
    console.error('Create consultation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la consultation : ' + error.message },
      { status: 500 }
    );
  }
}
