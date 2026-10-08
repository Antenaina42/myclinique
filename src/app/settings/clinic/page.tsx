import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import ClinicSettingsClient from './ClinicSettingsClient';

import { hasModuleAccess } from '@/lib/permissions';

export default async function ClinicSettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!hasModuleAccess(session.role, '/settings')) {
    redirect('/dashboard?unauthorized=1');
  }

  const [clinic, stats] = await Promise.all([
    prisma.clinic.findUnique({
      where: { id: session.clinicId },
      include: {
        settings: true,
      },
    }),
    Promise.all([
      prisma.patient.count({ where: { clinicId: session.clinicId } }),
      prisma.consultation.count({ where: { patient: { clinicId: session.clinicId } } }),
      prisma.invoice.count({ where: { clinicId: session.clinicId } }),
      prisma.medicine.count({ where: { clinicId: session.clinicId } }),
      prisma.user.count({ where: { clinicId: session.clinicId } }),
    ]),
  ]);

  if (!clinic) {
    redirect('/login');
  }

  const systemMetrics = {
    patientCount: stats[0],
    consultationCount: stats[1],
    invoiceCount: stats[2],
    medicineCount: stats[3],
    userCount: stats[4],
  };

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        {/* Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Administration</span>
              <span>/</span>
              <span className="text-slate-600 font-medium">Paramètres Clinique</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Paramètres Généraux de l'Établissement
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configuration de l'identité médicale, devise locale (Ariary), coordonnées et préférences de facturation
            </p>
          </div>
        </div>

        {/* Client Interactive Settings Form */}
        <ClinicSettingsClient
          initialClinic={clinic as any}
          systemMetrics={systemMetrics}
          userRole={session.role}
        />
      </div>
    </DashboardLayout>
  );
}
