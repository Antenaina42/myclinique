import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Pill,
  AlertTriangle,
  Clock,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  Package,
  Layers,
  Truck,
  ShoppingCart,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

import { hasModuleAccess } from '@/lib/permissions';

export default async function PharmacyPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!hasModuleAccess(session.role, '/pharmacy')) {
    redirect('/dashboard?unauthorized=1');
  }

  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const [medicines, lowStock, expiring, recentSales, categoriesCount, suppliersCount] = await Promise.all([
    prisma.medicine.findMany({
      where: { clinicId: session.clinicId, isActive: true },
      include: { category: true },
    }),
    prisma.medicine.findMany({
      where: { clinicId: session.clinicId, isActive: true, currentStock: { lte: 15 } },
      include: { category: true },
      orderBy: { currentStock: 'asc' },
    }),
    prisma.medicine.findMany({
      where: { clinicId: session.clinicId, isActive: true, expiryDate: { lte: thirtyDays } },
      include: { category: true },
      orderBy: { expiryDate: 'asc' },
    }),
    prisma.pharmacySale.findMany({
      where: { clinicId: session.clinicId },
      include: { items: true },
      orderBy: { saleDate: 'desc' },
      take: 6,
    }),
    prisma.medicineCategory.count(),
    prisma.supplier.count({ where: { clinicId: session.clinicId } }),
  ]);

  const isAdmin = session.role === 'SUPER_ADMIN' || session.role === 'CLINIC_ADMIN';
  const totalStockUnits = medicines.reduce((acc, m) => acc + m.currentStock, 0);
  const totalStockValue = isAdmin
    ? medicines.reduce((acc, m) => acc + (m.currentStock * m.purchasePrice), 0)
    : medicines.reduce((acc, m) => acc + (m.currentStock * m.sellingPrice), 0);

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Pharmacie</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Tableau de Bord Pharmacie
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestion de l'officine, traçabilité des stocks, alertes et ventes comptoir
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && (
              <Link
                href="/pharmacy/medicines"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nouveau Médicament</span>
              </Link>
            )}

            <Link
              href="/pharmacy/sales"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Caisse Ventes (POS)</span>
            </Link>

            <Link
              href="/pharmacy/stock"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Entrée / Sortie Stock</span>
            </Link>
          </div>
        </div>

        {/* Stats KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Références en stock
              </p>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">
                {medicines.length}
              </p>
              <span className="text-xs text-slate-500">
                {totalStockUnits} unités physiques
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isAdmin ? 'Valeur Marchande (Achat)' : 'Valeur Estimée (Vente)'}
              </p>
              <p className="text-xl font-extrabold text-slate-800 mt-1">
                {formatCurrency(totalStockValue)}
              </p>
              <span className="text-xs text-emerald-600 font-semibold">
                {categoriesCount} catégories
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ruptures / Stock Faible
              </p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">
                {lowStock.length}
              </p>
              <span className="text-xs text-rose-600 font-semibold">
                Réapprovisionnement requis
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Péremptions &lt; 30j
              </p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                {expiring.length}
              </p>
              <span className="text-xs text-amber-600 font-semibold">
                À retirer ou déstocker
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Two Columns: Alertes Stocks & Alertes Péremptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Faible */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Médicaments en Rupture ou Stock Faible ({lowStock.length})
                </h3>
              </div>
              <Link
                href="/pharmacy/medicines"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Catalogue
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStock.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Aucun médicament en rupture de stock.
                </p>
              ) : (
                lowStock.slice(0, 5).map((med) => (
                  <div key={med.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{med.name}</span>
                      <span className="text-[11px] text-slate-400 block">
                        DCI : {med.genericName} • Emplacement : {med.location || 'Rayon A'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        med.currentStock <= 2
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {med.currentStock} restant(s) (Seuil : {med.minStockLevel})
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Péremptions */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Alertes de Péremption Proche ({expiring.length})
                </h3>
              </div>
              <Link
                href="/pharmacy/medicines"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Voir tout
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {expiring.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Aucun produit proche de la péremption.
                </p>
              ) : (
                expiring.slice(0, 5).map((med) => (
                  <div key={med.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{med.name}</span>
                      <span className="text-[11px] text-slate-400 block">
                        Stock : {med.currentStock} unités • {med.dosage}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Expire le {formatDate(med.expiryDate)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
