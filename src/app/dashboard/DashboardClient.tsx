'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Calendar,
  Stethoscope,
  Pill,
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  FileText,
  DollarSign,
  Activity,
  AlertCircle,
  Receipt,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency, formatDate, formatDateTime, getStatusBadge } from '@/lib/formatters';
import { AuthUser } from '@/types';
import { getRoleBadgeLabel } from '@/lib/permissions';

interface DashboardClientProps {
  user: AuthUser;
  initialStats: any;
  recentAppointments: any[];
  recentSales: any[];
  lowStockMedicines?: any[];
  recentPatients?: any[];
  recentConsultations?: any[];
  doctorAppointments?: any[];
}

const chartData = [
  { month: 'Avr', Recettes: 1450000, Consultations: 45, Pharmacie: 820000 },
  { month: 'Mai', Recettes: 1980000, Consultations: 62, Pharmacie: 1100000 },
  { month: 'Juin', Recettes: 2350000, Consultations: 78, Pharmacie: 1450000 },
  { month: 'Juil', Recettes: 2800000, Consultations: 90, Pharmacie: 1600000 },
  { month: 'Août', Recettes: 3100000, Consultations: 105, Pharmacie: 1850000 },
  { month: 'Sept', Recettes: 3650000, Consultations: 120, Pharmacie: 2150000 },
];

export default function DashboardClient({
  user,
  initialStats,
  recentAppointments,
  recentSales,
  lowStockMedicines = [],
  recentPatients = [],
  recentConsultations = [],
  doctorAppointments = [],
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(
    searchParams?.get('unauthorized') === '1'
  );

  const roleInfo = getRoleBadgeLabel(user.role);
  const isReceptionist = user.role === 'RECEPTIONIST';
  const isPharmacist = user.role === 'PHARMACIST';
  const isDoctor = user.role === 'DOCTOR';
  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'CLINIC_ADMIN';

  return (
    <div className="space-y-6">
      {/* Alerte Accès Refusé / Redirection automatique */}
      {showUnauthorizedAlert && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Espace de travail protégé</p>
              <p className="text-[11px] text-amber-800">
                Votre profil <strong>{roleInfo.label}</strong> n'a pas accès à la page demandée. Vous avez été automatiquement redirigé vers votre espace dédié.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUnauthorizedAlert(false)}
            className="text-amber-700 hover:text-amber-900 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner / Welcome adapté au rôle */}
      <div className={`p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isReceptionist
          ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600'
          : isPharmacist
          ? 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700'
          : isDoctor
          ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700'
          : 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-700'
      }`}>
        <div>
          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/20 uppercase tracking-wider backdrop-blur-xs">
            {roleInfo.label} • {user.clinicName || 'MY CLINIQUE'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Bonjour, {isDoctor ? 'Dr. ' : ''}{user.firstName} {user.lastName} 👋
          </h1>
          <p className="text-sm text-white/90 mt-1 max-w-xl">
            {isReceptionist ? (
              <>
                Espace Accueil & Admissions. Vous avez{' '}
                <span className="font-bold underline">{initialStats.appointmentsToday} rendez-vous</span> programmés aujourd'hui et{' '}
                <span className="font-bold underline">{initialStats.patientsToday} nouveaux patients</span> accueillis.
              </>
            ) : isPharmacist ? (
              <>
                Espace Pharmacie & Délivrance. Aujourd'hui :{' '}
                <span className="font-bold underline">{formatCurrency(initialStats.salesTodayAmount)}</span> de ventes ({initialStats.salesTodayCount} tickets) et{' '}
                <span className="font-bold underline">{initialStats.lowStockCount} alertes de stock</span>.
              </>
            ) : isDoctor ? (
              <>
                Espace Praticien Médical. Vous avez{' '}
                <span className="font-bold underline">{doctorAppointments.length || initialStats.appointmentsToday} rendez-vous</span> et{' '}
                <span className="font-bold underline">{initialStats.doctorConsultationsToday || initialStats.consultationsToday} consultations</span> aujourd'hui.
              </>
            ) : (
              <>
                Supervision globale de l'établissement :{' '}
                <span className="font-bold underline">{initialStats.appointmentsToday} RDV</span>,{' '}
                <span className="font-bold underline">{initialStats.consultationsToday} consultations</span> et{' '}
                <span className="font-bold underline">{formatCurrency(initialStats.unpaidAmount)}</span> d'impayés en cours.
              </>
            )}
          </p>
        </div>

        {/* Boutons d'Action Rapide Spécifiques au Rôle */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Actions Accueil */}
          {isReceptionist && (
            <>
              <Link
                href="/appointments/new"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-amber-800 hover:bg-amber-50 shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>Nouveau Rendez-vous</span>
              </Link>
              <Link
                href="/patients/new"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-900/30 hover:bg-amber-900/40 text-white border border-white/30 backdrop-blur-xs transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Enregistrer Patient</span>
              </Link>
            </>
          )}

          {/* Actions Pharmacie */}
          {isPharmacist && (
            <>
              <Link
                href="/pharmacy/sales"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 shadow-sm transition-colors"
              >
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Caisse POS (Ticket 80mm)</span>
              </Link>
              <Link
                href="/pharmacy/stock"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-900/30 hover:bg-indigo-900/40 text-white border border-white/30 backdrop-blur-xs transition-colors"
              >
                <Pill className="w-4 h-4" />
                <span>Stocks & Mouvements</span>
              </Link>
            </>
          )}

          {/* Actions Médecin */}
          {isDoctor && (
            <>
              <Link
                href="/consultations/new"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 shadow-sm transition-colors"
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Nouvelle Consultation</span>
              </Link>
              <Link
                href="/prescriptions"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-900/30 hover:bg-emerald-900/40 text-white border border-white/30 backdrop-blur-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Ordonnances</span>
              </Link>
            </>
          )}

          {/* Actions Admin */}
          {isAdmin && (
            <>
              <Link
                href="/patients/new"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Patient</span>
              </Link>
              <Link
                href="/consultations/new"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Consultation</span>
              </Link>
              <Link
                href="/pharmacy/sales"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm transition-colors"
              >
                <Pill className="w-4 h-4" />
                <span>Caisse POS</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* KPI CARDS GRID (ADAPTÉ AU RÔLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* VUE 1 : ACCUEIL */}
        {isReceptionist ? (
          <>
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RDV Aujourd'hui</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">{initialStats.appointmentsToday}</span>
                  <span className="text-xs text-amber-600 font-bold">Programmés</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nouveaux Patients</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">{initialStats.patientsToday}</span>
                  <span className="text-xs text-emerald-600 font-bold">Aujourd'hui</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">{initialStats.totalPatients}</span>
                  <span className="text-xs text-slate-400">Dossiers</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Médecins Actifs</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">{initialStats.activeDoctorsCount}</span>
                  <span className="text-xs text-emerald-600 font-semibold">En service</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
          </>
        ) : isPharmacist ? (
          /* VUE 2 : PHARMACIE */
          <>
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recettes Pharmacie</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-slate-800">{formatCurrency(initialStats.salesTodayAmount)}</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">Aujourd'hui</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventes du jour</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">{initialStats.salesTodayCount}</span>
                  <span className="text-xs text-indigo-600 font-bold">Tickets délivrés</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ruptures & Stocks Bas</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-rose-600">{initialStats.lowStockCount}</span>
                  <span className="text-xs text-rose-600 font-semibold">À réapprovisionner</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Périmés / &lt; 30j</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-amber-600">{initialStats.expiringCount}</span>
                  <span className="text-xs text-amber-600 font-semibold">À surveiller</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Pill className="w-6 h-6" />
              </div>
            </div>
          </>
        ) : isDoctor ? (
          /* VUE 3 : MÉDECIN */
          <>
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mes Consultations</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">
                    {initialStats.doctorConsultationsToday || initialStats.consultationsToday}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">Aujourd'hui</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mes Rendez-vous</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">
                    {doctorAppointments.length || initialStats.appointmentsToday}
                  </span>
                  <span className="text-xs text-blue-600 font-bold">Programmés</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patients de la clinique</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">{initialStats.totalPatients}</span>
                  <span className="text-xs text-slate-400">Dossiers</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ordonnances</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">
                    {initialStats.doctorPrescriptionsCount || 'Actives'}
                  </span>
                  <span className="text-xs text-teal-600 font-semibold">Rédigées</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </>
        ) : (
          /* VUE 4 : ADMIN GLOBAL */
          <>
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patients du jour</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">{initialStats.patientsToday}</span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    Total {initialStats.totalPatients}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consultations aujourd'hui</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-800">{initialStats.consultationsToday}</span>
                  <span className="text-xs text-blue-600 font-semibold">Actives</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertes Pharmacie</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-rose-600">{initialStats.lowStockCount}</span>
                  <span className="text-xs text-rose-600 font-semibold">Ruptures</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Créances Impayées</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-amber-600">{formatCurrency(initialStats.unpaidAmount)}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* SECTIONS DÉTAILLÉES SPÉCIFIQUES PAR RÔLE */}

      {/* --- 1. ACCUEIL : RENDEZ-VOUS DU JOUR & DERNIERS PATIENTS --- */}
      {isReceptionist && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Rendez-vous programmés aujourd'hui ({recentAppointments.length})
                </h3>
              </div>
              <Link href="/appointments/new" className="text-xs text-amber-600 hover:underline font-bold">
                + Nouveau RDV
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentAppointments.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Aucun rendez-vous prévu pour aujourd'hui.</p>
              ) : (
                recentAppointments.map((apt: any) => (
                  <div key={apt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-mono font-bold text-xs">
                        {apt.startTime}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {apt.patient?.lastName} {apt.patient?.firstName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Praticien : Dr. {apt.doctor?.user?.lastName || 'Généraliste'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                      {apt.status || 'CONFIRMED'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Patients Récents</h3>
              </div>
              <Link href="/patients/new" className="text-xs text-blue-600 hover:underline font-bold">
                + Ajouter
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPatients.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">Aucun patient récent.</p>
              ) : (
                recentPatients.map((p: any) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{p.lastName} {p.firstName}</p>
                      <p className="text-[11px] text-slate-400">{p.patientNumber} • {p.phone || 'Pas de tél'}</p>
                    </div>
                    <Link
                      href={`/appointments/new?patientId=${p.id}`}
                      className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-semibold"
                    >
                      Prendre RDV
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 2. PHARMACIE : VENTES DU JOUR & ALERTES STOCKS --- */}
      {isPharmacist && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Dernières Ventes Comptoir & Reçus Thermiques
                </h3>
              </div>
              <Link href="/pharmacy/sales" className="text-xs text-indigo-600 hover:underline font-bold">
                Accéder au POS →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentSales.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Aucune vente enregistrée.</p>
              ) : (
                recentSales.map((sale: any) => (
                  <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600">{sale.saleNumber}</span>
                        <span className="text-slate-700 font-semibold">{sale.customerName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateTime(sale.saleDate)} • {sale.items?.length || 0} produit(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900">{formatCurrency(sale.total)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-800 text-sm">Médicaments en Alerte Stock</h3>
              </div>
              <Link href="/pharmacy/stock" className="text-xs text-rose-600 hover:underline font-bold">
                Gérer les stocks →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStockMedicines.length === 0 ? (
                <p className="py-8 text-center text-xs text-emerald-600 font-semibold">
                  ✓ Tous les stocks sont au-dessus du seuil d'alerte.
                </p>
              ) : (
                lowStockMedicines.map((med: any) => (
                  <div key={med.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{med.name}</p>
                      <p className="text-[11px] text-slate-400">{med.dosage} • {med.form}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        med.currentStock <= 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {med.currentStock <= 0 ? 'Rupture' : `${med.currentStock} restant(s)`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 3. MÉDECIN : AGENDA PRATICIEN & DERNIÈRES CONSULTATIONS --- */}
      {isDoctor && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Mon Agenda de Consultations Aujourd'hui
                </h3>
              </div>
              <Link href="/consultations/new" className="text-xs text-emerald-600 hover:underline font-bold">
                + Consultation
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {(doctorAppointments.length > 0 ? doctorAppointments : recentAppointments).length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Aucun patient programmé pour aujourd'hui.</p>
              ) : (
                (doctorAppointments.length > 0 ? doctorAppointments : recentAppointments).map((apt: any) => (
                  <div key={apt.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs">
                        {apt.startTime}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {apt.patient?.lastName} {apt.patient?.firstName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Motif : {apt.reason || 'Consultation générale'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/consultations/new?patientId=${apt.patientId}&appointmentId=${apt.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                    >
                      Examiner
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Dernières Consultations</h3>
              </div>
              <Link href="/consultations" className="text-xs text-blue-600 hover:underline font-bold">
                Voir toutes →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentConsultations.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">Aucune consultation récente.</p>
              ) : (
                recentConsultations.map((c: any) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">
                        {c.patient?.lastName} {c.patient?.firstName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatDateTime(c.consultationDate)}
                      </p>
                    </div>
                    <Link
                      href={`/consultations/${c.id}`}
                      className="text-blue-600 hover:underline text-xs font-semibold"
                    >
                      Dossier
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 4. ADMIN : GRAPHIQUES GLOBAUX & RECAP FINANCIER --- */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Évolution Financière & Activité Clinique
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recettes globales (Ar) et nombre de consultations par mois
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-600">
                  6 derniers mois
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="recettesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1677FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1677FF" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="pharmacieGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#20C997" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#20C997" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(val: any) => formatCurrency(Number(val))}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area
                      type="monotone"
                      dataKey="Recettes"
                      stroke="#1677FF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#recettesGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Pharmacie"
                      stroke="#20C997"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#pharmacieGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Synthèse de Performance</h3>
                <p className="text-xs text-slate-400 mt-0.5">Indicateurs clés de gestion</p>
                <div className="space-y-4 mt-5">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-xs text-slate-600 font-medium">Recettes Pharmacie Aujourd'hui</span>
                    <span className="text-xs font-extrabold text-blue-700">{formatCurrency(initialStats.salesTodayAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                    <span className="text-xs text-slate-600 font-medium">Créances en Attente</span>
                    <span className="text-xs font-extrabold text-rose-700">{formatCurrency(initialStats.unpaidAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <span className="text-xs text-slate-600 font-medium">Patients Actifs</span>
                    <span className="text-xs font-extrabold text-emerald-700">{initialStats.totalPatients}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/reports"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <span>Consulter les Rapports Financiers</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
