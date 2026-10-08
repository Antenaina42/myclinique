import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Users,
  PlusCircle,
  Search,
  FileText,
  Stethoscope,
  ChevronRight,
  Eye,
  Calendar,
  Phone,
  HeartPulse,
} from 'lucide-react';
import { calculateAge, formatDate } from '@/lib/formatters';

interface PatientsPageProps {
  searchParams: { q?: string; page?: string };
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const q = searchParams.q?.trim() || '';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 15;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    clinicId: session.clinicId,
    deletedAt: null,
  };

  if (q) {
    whereClause.OR = [
      { lastName: { contains: q } },
      { firstName: { contains: q } },
      { patientNumber: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const [total, patients] = await Promise.all([
    prisma.patient.count({ where: whereClause }),
    prisma.patient.findMany({
      where: whereClause,
      include: {
        primaryDoctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            specialty: { select: { name: true } },
          },
        },
        _count: {
          select: {
            consultations: true,
            prescriptions: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Patients</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Gestion des Patients ({total})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Répertoire des dossiers médicaux informatisés de la clinique
            </p>
          </div>

          <Link
            href="/patients/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau Patient</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Rechercher par nom, prénom, identifiant (PAT-XXXX) ou téléphone..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
            >
              Filtrer
            </button>
            {q && (
              <Link
                href="/patients"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 text-center transition-colors"
              >
                Réinitialiser
              </Link>
            )}
          </form>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Identifiant</th>
                  <th className="py-3 px-4">Âge / Sexe</th>
                  <th className="py-3 px-4">Groupe Sanguin</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Médecin Référent</th>
                  <th className="py-3 px-4">Dossier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Aucun patient trouvé.
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => {
                    const age = calculateAge(p.birthDate);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/patients/${p.id}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {p.lastName} {p.firstName}
                              </p>
                              <span className="text-[11px] text-slate-400">
                                {p.city || 'Antananarivo'}
                              </span>
                            </div>
                          </Link>
                        </td>

                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                          {p.patientNumber}
                        </td>

                        {/* Age / Gender */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="font-medium">{age} ans</span>
                          <span className="text-slate-400 text-[11px] block">
                            {p.gender === 'FEMALE' ? 'Féminin' : 'Masculin'}
                          </span>
                        </td>

                        {/* Blood Group */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                            <HeartPulse className="w-3 h-3 mr-1 text-rose-500" />
                            {p.bloodGroup || 'O+'}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{p.phone}</span>
                          </div>
                          {p.email && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                              {p.email}
                            </span>
                          )}
                        </td>

                        {/* Doctor */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {p.primaryDoctor ? (
                            <div>
                              <span className="font-semibold text-slate-800">
                                Dr. {p.primaryDoctor.user.lastName}
                              </span>
                              <span className="text-[11px] text-slate-400 block">
                                {p.primaryDoctor.specialty.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Non assigné</span>
                          )}
                        </td>

                        {/* Summary Counts */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span title="Consultations" className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                              {p._count.consultations} consult.
                            </span>
                            <span title="Ordonnances" className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                              {p._count.prescriptions} ord.
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/patients/${p.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Voir la fiche complète"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              href={`/consultations/new?patientId=${p.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Nouvelle consultation"
                            >
                              <Stethoscope className="w-4 h-4" />
                            </Link>

                            <Link
                              href={`/prescriptions/new?patientId=${p.id}`}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Nouvelle ordonnance"
                            >
                              <FileText className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {page} sur {totalPages} ({total} patients au total)
              </span>
              <div className="flex items-center gap-1">
                {page > 1 && (
                  <Link
                    href={`/patients?page=${page - 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    Précédent
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/patients?page=${page + 1}${q ? `&q=${q}` : ''}`}
                    className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    Suivant
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
