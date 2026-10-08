import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import PatientDetailTabs from './PatientDetailTabs';
import Link from 'next/link';

interface PatientDetailPageProps {
  params: { id: string };
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      clinic: true,
      medicalRecord: true,
      primaryDoctor: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          specialty: { select: { name: true } },
        },
      },
      consultations: {
        include: {
          doctor: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              specialty: { select: { name: true } },
            },
          },
          vitalSigns: true,
          prescription: true,
        },
        orderBy: { consultationDate: 'desc' },
      },
      prescriptions: {
        include: {
          doctor: {
            include: {
              user: { select: { firstName: true, lastName: true } },
              specialty: { select: { name: true } },
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        include: {
          items: true,
          payments: true,
        },
        orderBy: { issuedDate: 'desc' },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      appointments: {
        include: {
          doctor: { include: { user: true } },
        },
        orderBy: { appointmentDate: 'desc' },
      },
    },
  });

  if (!patient || patient.deletedAt) {
    notFound();
  }

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
          <span>/</span>
          <Link href="/patients" className="hover:text-blue-600">Patients</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{patient.lastName} {patient.firstName}</span>
        </div>

        {/* Patient Interactive View with 6 Tabs */}
        <PatientDetailTabs patient={patient} userRole={session.role} />
      </div>
    </DashboardLayout>
  );
}
