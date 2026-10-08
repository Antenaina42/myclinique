import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        clinicId: session.clinicId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        roleId: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        doctorProfile: {
          select: {
            id: true,
            licenseNumber: true,
            specialtyId: true,
            workingHours: true,
            bio: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // RBAC: Only Super Admin and Clinic Admin can edit other users
  if (session.role !== 'SUPER_ADMIN' && session.role !== 'CLINIC_ADMIN' && session.id !== params.id) {
    return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      isActive,
      roleId,
      password,
      specialtyId,
      licenseNumber,
      workingHours,
      bio,
    } = body;

    const existingUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        clinicId: session.clinicId,
      },
      include: {
        role: true,
        doctorProfile: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined && (session.role === 'SUPER_ADMIN' || session.role === 'CLINIC_ADMIN')) {
      // Prevent deactivating own account if only admin
      if (session.id === params.id && isActive === false) {
        return NextResponse.json({ error: 'Vous ne pouvez pas désactiver votre propre compte administrateur.' }, { status: 400 });
      }
      updateData.isActive = isActive;
    }
    if (roleId && (session.role === 'SUPER_ADMIN' || session.role === 'CLINIC_ADMIN')) {
      updateData.roleId = roleId;
    }
    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: params.id },
        data: updateData,
        include: { role: true },
      });

      // If user is/became doctor, update or create doctor profile
      if (user.role.name === 'DOCTOR') {
        if (existingUser.doctorProfile) {
          await tx.doctor.update({
            where: { id: existingUser.doctorProfile.id },
            data: {
              specialtyId: specialtyId || existingUser.doctorProfile.specialtyId,
              licenseNumber: licenseNumber || existingUser.doctorProfile.licenseNumber,
              workingHours: workingHours !== undefined ? workingHours : existingUser.doctorProfile.workingHours,
              bio: bio !== undefined ? bio : existingUser.doctorProfile.bio,
            },
          });
        } else if (specialtyId && licenseNumber) {
          await tx.doctor.create({
            data: {
              clinicId: session.clinicId,
              userId: user.id,
              specialtyId,
              licenseNumber,
              workingHours: workingHours || 'Lun - Ven: 08h00 - 17h00',
              bio: bio || null,
            },
          });
        }
      }

      return user;
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: updatedUser.id,
      details: `Mise à jour du compte de ${updatedUser.firstName} ${updatedUser.lastName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (session.role !== 'SUPER_ADMIN' && session.role !== 'CLINIC_ADMIN') {
    return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  if (session.id === params.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        clinicId: session.clinicId,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // In a medical system with audit trails, soft deactivation is preferred to preserve foreign keys
    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.DELETE,
      entity: 'User',
      entityId: params.id,
      details: `Désactivation du compte utilisateur ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Compte utilisateur désactivé avec succès',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Erreur lors de la désactivation' }, { status: 500 });
  }
}
