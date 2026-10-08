import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { CreditCard, PlusCircle, Download, DollarSign } from 'lucide-react';
import InvoicesClient from './InvoicesClient';

import { hasModuleAccess } from '@/lib/permissions';

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!hasModuleAccess(session.role, '/invoices')) {
    redirect('/dashboard?unauthorized=1');
  }

  const invoices = await prisma.invoice.findMany({
    where: { clinicId: session.clinicId },
    include: {
      patient: true,
      items: true,
      payments: true,
    },
    orderBy: { issuedDate: 'desc' },
    take: 50,
  });

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Facturation</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Facturation & Règlements ({invoices.length})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi des factures médicales, encaissements et recouvrement des impayés
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/payments"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Journal de Caisse
            </Link>

            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouvelle Facture</span>
            </Link>
          </div>
        </div>

        <InvoicesClient initialInvoices={invoices} />
      </div>
    </DashboardLayout>
  );
}
