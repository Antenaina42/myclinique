import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const doctors = await prisma.doctor.findMany({
      where: { clinicId: session.clinicId },
      include: {
        user: true,
        specialty: true,
        _count: {
          select: {
            consultations: true,
            prescriptions: true,
            appointments: true,
          },
        },
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
