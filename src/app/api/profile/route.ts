import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, verifyPassword, hashPassword } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            slogan: true,
            currency: true,
            address: true,
            phone: true,
          },
        },
        doctorProfile: {
          select: {
            id: true,
            licenseNumber: true,
            workingHours: true,
            bio: true,
            specialty: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                consultations: true,
                prescriptions: true,
                appointments: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const recentLogs = await prisma.auditLog.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        entity: true,
        details: true,
        createdAt: true,
        ipAddress: true,
      },
    });

    return NextResponse.json({ user, recentLogs });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement du profil' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      bio,
      workingHours,
      currentPassword,
      newPassword,
    } = body;

    const currentUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: { doctorProfile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;

    // Password change request
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Veuillez saisir votre mot de passe actuel.' }, { status: 400 });
      }

      const isMatch = await verifyPassword(currentPassword, currentUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Le mot de passe actuel est incorrect.' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: session.id },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });

      if (currentUser.doctorProfile && (bio !== undefined || workingHours !== undefined)) {
        await tx.doctor.update({
          where: { id: currentUser.doctorProfile.id },
          data: {
            bio: bio !== undefined ? bio : currentUser.doctorProfile.bio,
            workingHours: workingHours !== undefined ? workingHours : currentUser.doctorProfile.workingHours,
          },
        });
      }

      return u;
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: session.id,
      details: newPassword
        ? `Modification du profil et du mot de passe par ${updated.firstName} ${updated.lastName}`
        : `Mise à jour des informations de profil par ${updated.firstName} ${updated.lastName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updated,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
