import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import InvoiceFormClient from './InvoiceFormClient';
import Link from 'next/link';

interface NewInvoicePageProps {
  searchParams: { patientId?: string };
}

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.clinicId, deletedAt: null },
    select: { id: true, patientNumber: true, firstName: true, lastName: true },
    orderBy: { lastName: 'asc' },
  });

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
          <span>/</span>
          <Link href="/invoices" className="hover:text-blue-600">Facturation</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Nouvelle Facture</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Émission d'une Facture Médicale
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Création de facture avec actes, consultations ou prestations de laboratoire
          </p>
        </div>

        <InvoiceFormClient
          patients={patients}
          initialPatientId={searchParams.patientId || ''}
        />
      </div>
    </DashboardLayout>
  );
}
