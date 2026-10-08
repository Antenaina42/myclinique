import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';
import { AuditAction, RoleType } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const search = searchParams.get('search');

  try {
    const where: any = {
      clinicId: session.clinicId,
    };

    if (role && role !== 'ALL') {
      where.role = {
        name: role as RoleType,
      };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
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
            workingHours: true,
            specialty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });

    const specialties = await prisma.specialty.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ users, roles, specialties });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des utilisateurs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // RBAC Check: Only Super Admin and Clinic Admin can create users
  if (session.role !== 'SUPER_ADMIN' && session.role !== 'CLINIC_ADMIN') {
    return NextResponse.json({ error: 'Accès interdit. Droits insuffisants.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      roleId,
      specialtyId,
      licenseNumber,
      workingHours,
      bio,
    } = body;

    if (!firstName || !lastName || !email || !password || !roleId) {
      return NextResponse.json({ error: 'Champs obligatoires manquants (Nom, Prénom, Email, Mot de passe, Rôle).' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Cette adresse email est déjà utilisée.' }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Rôle invalide.' }, { status: 400 });
    }

    // If DOCTOR role, validate doctor-specific fields
    if (role.name === 'DOCTOR') {
      if (!specialtyId || !licenseNumber) {
        return NextResponse.json({ error: 'Pour un médecin, la spécialité et le numéro d’ordre sont obligatoires.' }, { status: 400 });
      }

      const existingLicense = await prisma.doctor.findUnique({
        where: { licenseNumber },
      });
      if (existingLicense) {
        return NextResponse.json({ error: 'Ce numéro d’ordre médical est déjà enregistré.' }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          clinicId: session.clinicId,
          firstName,
          lastName,
          email,
          phone: phone || null,
          passwordHash,
          roleId,
          isActive: true,
        },
      });

      if (role.name === 'DOCTOR' && specialtyId && licenseNumber) {
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

      return user;
    });

    await logAuditAction({
      clinicId: session.clinicId,
      userId: session.id,
      action: AuditAction.CREATE,
      entity: 'User',
      entityId: newUser.id,
      details: `Création du collaborateur ${firstName} ${lastName} (${email}) avec rôle ${role.displayName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de la création du compte' }, { status: 500 });
  }
}
