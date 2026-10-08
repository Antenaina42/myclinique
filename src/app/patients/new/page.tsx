import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import PatientFormClient from './PatientFormClient';
import Link from 'next/link';

export default async function NewPatientPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: session.clinicId },
    include: {
      user: { select: { firstName: true, lastName: true } },
      specialty: { select: { name: true } },
    },
  });

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
          <span>/</span>
          <Link href="/patients" className="hover:text-blue-600">Patients</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Nouveau Patient</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Enregistrement d'un Patient
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Création du dossier médical informatisé et ouverture du compte patient
          </p>
        </div>

        <PatientFormClient doctors={doctors} />
      </div>
    </DashboardLayout>
  );
}
