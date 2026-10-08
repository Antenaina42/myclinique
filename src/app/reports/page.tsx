import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import ReportsClient from './ReportsClient';

import { hasModuleAccess } from '@/lib/permissions';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!hasModuleAccess(session.role, '/reports')) {
    redirect('/dashboard?unauthorized=1');
  }

  const [
    totalPatients,
    malePatients,
    femalePatients,
    consultationsCount,
    prescriptionsCount,
    invoicesSummary,
    topMedicines,
    doctorsActivity,
  ] = await Promise.all([
    prisma.patient.count({ where: { clinicId: session.clinicId, deletedAt: null } }),
    prisma.patient.count({ where: { clinicId: session.clinicId, gender: 'MALE', deletedAt: null } }),
    prisma.patient.count({ where: { clinicId: session.clinicId, gender: 'FEMALE', deletedAt: null } }),
    prisma.consultation.count({ where: { patient: { clinicId: session.clinicId } } }),
    prisma.prescription.count({ where: { patient: { clinicId: session.clinicId } } }),
    prisma.invoice.aggregate({
      where: { clinicId: session.clinicId },
      _sum: { totalAmount: true, paidAmount: true, balance: true },
      _count: true,
    }),
    prisma.pharmacySaleItem.groupBy({
      by: ['medicineName'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 6,
    }),
    prisma.doctor.findMany({
      where: { clinicId: session.clinicId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        specialty: { select: { name: true } },
        _count: { select: { consultations: true, prescriptions: true } },
      },
    }),
  ]);

  const reportData = {
    patients: {
      total: totalPatients,
      male: malePatients,
      female: femalePatients,
    },
    activity: {
      consultations: consultationsCount,
      prescriptions: prescriptionsCount,
    },
    financial: {
      invoicesCount: invoicesSummary._count,
      totalBilled: invoicesSummary._sum.totalAmount || 0,
      totalCollected: invoicesSummary._sum.paidAmount || 0,
      totalUnpaid: invoicesSummary._sum.balance || 0,
    },
    topMedicines,
    doctorsActivity,
  };

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Rapports & Statistiques</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Rapports Analytiques & Statistiques Cliniques
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Indicateurs de performance médicale, ratios de fréquentation et bilan financier
          </p>
        </div>

        <ReportsClient data={reportData} />
      </div>
    </DashboardLayout>
  );
}
