import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        clinicId: session.clinicId,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
  }
}

export async function PATCH() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    await prisma.notification.updateMany({
      where: {
        clinicId: session.clinicId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
