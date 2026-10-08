import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import PrescriptionFormClient from './PrescriptionFormClient';
import Link from 'next/link';

interface NewPrescriptionPageProps {
  searchParams: { patientId?: string };
}

export default async function NewPrescriptionPage({ searchParams }: NewPrescriptionPageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const [patients, doctors, medicines] = await Promise.all([
    prisma.patient.findMany({
      where: { clinicId: session.clinicId, deletedAt: null },
      select: {
        id: true,
        patientNumber: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        gender: true,
      },
      orderBy: { lastName: 'asc' },
    }),
    prisma.doctor.findMany({
      where: { clinicId: session.clinicId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        specialty: { select: { name: true } },
      },
    }),
    prisma.medicine.findMany({
      where: { clinicId: session.clinicId, isActive: true },
      select: {
        id: true,
        name: true,
        genericName: true,
        dosage: true,
        form: true,
        currentStock: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
          <span>/</span>
          <Link href="/prescriptions" className="hover:text-blue-600">Ordonnances</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Nouvelle Ordonnance</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Émission d'une Ordonnance Médicale
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription certifiée avec posologie détaillée et QR code de vérification
          </p>
        </div>

        <PrescriptionFormClient
          patients={patients}
          doctors={doctors}
          medicines={medicines}
          initialPatientId={searchParams.patientId || ''}
          currentDoctorId={session.doctorId || ''}
        />
      </div>
    </DashboardLayout>
  );
}
