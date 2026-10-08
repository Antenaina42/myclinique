import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AppointmentStatus, AuditAction } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId');

  try {
    const whereClause: any = {
      patient: { clinicId: session.clinicId },
    };
    if (doctorId) whereClause.doctorId = doctorId;

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: true,
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            specialty: { select: { name: true } },
          },
        },
      },
      orderBy: [{ appointmentDate: 'desc' }, { startTime: 'asc' }],
      take: 100,
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error);
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
    const { patientId, doctorId, appointmentDate, startTime, reason, notes } = body;

    if (!patientId || !doctorId || !appointmentDate || !startTime) {
      return NextResponse.json(
        { error: 'Patient, Médecin, Date et Heure sont obligatoires.' },
        { status: 400 }
      );
    }

    const apt = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        startTime,
        reason: reason || 'Consultation générale',
        notes: notes || null,
        status: AppointmentStatus.CONFIRMED,
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.CREATE,
      entity: 'Appointment',
      entityId: apt.id,
      details: `Rendez-vous programmé pour ${apt.patient.lastName} avec Dr. ${apt.doctor.user.lastName} le ${startTime}`,
    });

    return NextResponse.json({ success: true, appointment: apt }, { status: 201 });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Erreur création RDV : ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json({ error: 'ID et statut requis' }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as AppointmentStatus },
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Erreur mise à jour RDV' }, { status: 500 });
  }
}
