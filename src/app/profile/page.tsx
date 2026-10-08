import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [user, recentLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: {
        role: true,
        clinic: true,
        doctorProfile: {
          include: {
            specialty: true,
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
    }),
    prisma.auditLog.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ]);

  if (!user) redirect('/login');

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Mon Profil</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Profil Collaborateur & Sécurité
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestion de vos coordonnées, modification de votre mot de passe et historique de vos actions
            </p>
          </div>
        </div>

        {/* Client Interactive Profile Component */}
        <ProfileClient user={user as any} recentLogs={recentLogs as any} />
      </div>
    </DashboardLayout>
  );
}
