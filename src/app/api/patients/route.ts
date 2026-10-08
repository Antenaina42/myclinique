import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction, Gender } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {
      clinicId: session.clinicId,
      deletedAt: null,
    };

    if (q) {
      whereClause.OR = [
        { lastName: { contains: q } },
        { firstName: { contains: q } },
        { patientNumber: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where: whereClause }),
      prisma.patient.findMany({
        where: whereClause,
        include: {
          primaryDoctor: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              specialty: { select: { name: true } },
            },
          },
          _count: {
            select: {
              consultations: true,
              prescriptions: true,
              invoices: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Fetch patients error:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des patients' }, { status: 500 });
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
      firstName,
      lastName,
      gender,
      birthDate,
      bloodGroup,
      phone,
      email,
      address,
      city,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRel,
      primaryDoctorId,
      allergies,
      chronicDiseases,
      surgicalHistory,
      familyHistory,
      habits,
      generalNotes,
    } = body;

    if (!firstName || !lastName || !birthDate || !phone) {
      return NextResponse.json(
        { error: 'Le prénom, nom, date de naissance et téléphone sont obligatoires.' },
        { status: 400 }
      );
    }

    // Génération automatique du numéro patient PAT-2026-XXXX
    const count = await prisma.patient.count({ where: { clinicId: session.clinicId } });
    const currentYear = new Date().getFullYear();
    const patientNumber = `PAT-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        clinicId: session.clinicId,
        patientNumber,
        firstName,
        lastName,
        gender: gender === 'FEMALE' ? Gender.FEMALE : Gender.MALE,
        birthDate: new Date(birthDate),
        bloodGroup: bloodGroup || 'O+',
        phone,
        email: email || null,
        address: address || null,
        city: city || 'Antananarivo',
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        emergencyContactRel: emergencyContactRel || null,
        primaryDoctorId: primaryDoctorId || null,
        isActive: true,
        medicalRecord: {
          create: {
            allergies: allergies || null,
            chronicDiseases: chronicDiseases || null,
            surgicalHistory: surgicalHistory || null,
            familyHistory: familyHistory || null,
            habits: habits || null,
            generalNotes: generalNotes || 'Dossier créé via My Clinique.',
          },
        },
      },
      include: {
        medicalRecord: true,
      },
    });

    // Journal d'audit
    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.CREATE,
      entity: 'Patient',
      entityId: patient.id,
      details: `Création du patient ${patient.lastName} ${patient.firstName} (${patient.patientNumber})`,
    });

    return NextResponse.json({ success: true, patient }, { status: 201 });
  } catch (error: any) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du patient : ' + (error.message || '') },
      { status: 500 }
    );
  }
}
