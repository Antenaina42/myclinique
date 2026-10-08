import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import StockClient from './StockClient';

export default async function StockPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [medicines, suppliers, entries, exits] = await Promise.all([
    prisma.medicine.findMany({
      where: { clinicId: session.clinicId, isActive: true },
      select: { id: true, name: true, genericName: true, dosage: true, form: true, currentStock: true },
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.findMany({
      where: { clinicId: session.clinicId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.stockEntry.findMany({
      where: { medicine: { clinicId: session.clinicId } },
      include: { medicine: true, supplier: true },
      orderBy: { entryDate: 'desc' },
      take: 25,
    }),
    prisma.stockExit.findMany({
      where: { medicine: { clinicId: session.clinicId } },
      include: { medicine: true },
      orderBy: { exitDate: 'desc' },
      take: 25,
    }),
  ]);

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <Link href="/pharmacy" className="hover:text-blue-600">Pharmacie</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Stocks & Mouvements</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Gestion des Stocks & Mouvements
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Entrées fournisseurs, sorties pour avaries/péremptions et traçabilité des numéros de lots
            </p>
          </div>
        </div>

        <StockClient
          medicines={medicines}
          suppliers={suppliers}
          initialEntries={entries}
          initialExits={exits}
        />
      </div>
    </DashboardLayout>
  );
}
