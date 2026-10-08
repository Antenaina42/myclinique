import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { DollarSign, ArrowDownRight, ArrowUpRight, Wallet, Receipt, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default async function PaymentsCashPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [transactions, payments, todayIncome, todayExpense] = await Promise.all([
    prisma.cashTransaction.findMany({
      where: { clinicId: session.clinicId },
      include: { performedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { transactionDate: 'desc' },
      take: 50,
    }),
    prisma.payment.findMany({
      where: { invoice: { clinicId: session.clinicId } },
      include: {
        invoice: { include: { patient: true } },
      },
      orderBy: { paymentDate: 'desc' },
      take: 25,
    }),
    prisma.cashTransaction.aggregate({
      where: {
        clinicId: session.clinicId,
        type: 'INCOME',
        transactionDate: { gte: today, lt: tomorrow },
      },
      _sum: { amount: true },
    }),
    prisma.cashTransaction.aggregate({
      where: {
        clinicId: session.clinicId,
        type: 'EXPENSE',
        transactionDate: { gte: today, lt: tomorrow },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalIncomeToday = todayIncome._sum.amount || 0;
  const totalExpenseToday = todayExpense._sum.amount || 0;
  const netCashToday = totalIncomeToday - totalExpenseToday;

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Caisse & Règlements</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Journal de Caisse & Règlements
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi des flux de trésorerie, encaissements consultations/pharmacie et clôture
            </p>
          </div>

          <Link
            href="/invoices"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Voir Factures
          </Link>
        </div>

        {/* Daily Cash KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Recettes du Jour
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatCurrency(totalIncomeToday)}
              </p>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Entrées de caisse
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Dépenses du Jour
              </p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">
                {formatCurrency(totalExpenseToday)}
              </p>
              <span className="text-xs text-rose-700 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Sorties caisse
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Solde Net du Jour
              </p>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">
                {formatCurrency(netCashToday)}
              </p>
              <span className="text-xs text-blue-600 font-medium">
                Disponible en caisse
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Transactions Récentes ({transactions.length})
            </h3>
            <span className="text-xs text-slate-400">Journal horodaté</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date / Heure</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Aucune transaction enregistrée.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {formatDate(tx.transactionDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'INCOME'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {tx.type === 'INCOME' ? '+ Recette' : '- Dépense'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {tx.paymentMethod}
                      </td>
                      <td className={`py-3 px-4 font-extrabold text-right ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
