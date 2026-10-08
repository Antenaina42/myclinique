import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import AppointmentFormClient from './AppointmentFormClient';
import Link from 'next/link';

export default async function NewAppointmentPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [patients, doctors] = await Promise.all([
    prisma.patient.findMany({
      where: { clinicId: session.clinicId, deletedAt: null },
      select: { id: true, patientNumber: true, firstName: true, lastName: true },
      orderBy: { lastName: 'asc' },
    }),
    prisma.doctor.findMany({
      where: { clinicId: session.clinicId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        specialty: { select: { name: true } },
      },
    }),
  ]);

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
          <span>/</span>
          <Link href="/appointments" className="hover:text-blue-600">Rendez-vous</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Nouveau RDV</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Programmer un Rendez-vous
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Planification d'une consultation médicale ou d'un acte spécialisé
          </p>
        </div>

        <AppointmentFormClient patients={patients} doctors={doctors} />
      </div>
    </DashboardLayout>
  );
}
