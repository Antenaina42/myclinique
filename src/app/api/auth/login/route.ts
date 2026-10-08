import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: true,
        doctorProfile: true,
        clinic: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Identifiants invalides ou compte inactif' },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Mise à jour de la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const sessionPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name as any,
      clinicId: user.clinicId,
      clinicName: user.clinic?.name || 'Clinique Médicale',
      doctorId: user.doctorProfile?.id,
      avatar: user.avatar || undefined,
    };

    await setSessionCookie(sessionPayload);

    await logAuditAction({
      clinicId: user.clinicId,
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      details: `Connexion réussie de ${user.firstName} ${user.lastName} (${user.role.displayName})`,
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      redirect: '/dashboard',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de la connexion',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
