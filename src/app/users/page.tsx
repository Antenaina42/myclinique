import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import UsersClient from './UsersClient';

import { hasModuleAccess } from '@/lib/permissions';

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!hasModuleAccess(session.role, '/users')) {
    redirect('/dashboard?unauthorized=1');
  }

  const [users, roles, specialties] = await Promise.all([
    prisma.user.findMany({
      where: { clinicId: session.clinicId },
      include: {
        role: true,
        doctorProfile: {
          include: {
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.role.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.specialty.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Administration</span>
              <span>/</span>
              <span className="text-slate-600 font-medium">Utilisateurs</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Gestion des Utilisateurs & Rôles
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestion des comptes du personnel soignant et administratif, contrôle d'accès RBAC et habilitations
            </p>
          </div>
        </div>

        {/* Client Interactive Component */}
        <UsersClient
          initialUsers={users as any}
          roles={roles}
          specialties={specialties}
          currentUserRole={session.role}
          currentUserId={session.id}
        />
      </div>
    </DashboardLayout>
  );
}
