import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Stethoscope, PlusCircle, Calendar, User, Eye, HeartPulse, Activity } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

import { hasModuleAccess } from '@/lib/permissions';

export default async function ConsultationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!hasModuleAccess(session.role, '/consultations')) {
    redirect('/dashboard?unauthorized=1');
  }

  const consultations = await prisma.consultation.findMany({
    where: {
      patient: { clinicId: session.clinicId },
      ...(session.role === 'DOCTOR' && session.doctorId ? { doctorId: session.doctorId } : {}),
    },
    include: {
      patient: true,
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
              <span className="text-slate-600 font-medium">Consultations</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Consultations Médicales ({consultations.length})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Historique des actes médicaux, examens cliniques et diagnostics
            </p>
          </div>

          <Link
            href="/consultations/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvelle Consultation</span>
          </Link>
        </div>

        {/* Consultations List Cards */}
        <div className="space-y-4">
          {consultations.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
              Aucune consultation enregistrée pour l'instant.
            </div>
          ) : (
            consultations.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <Link
                        href={`/patients/${c.patientId}`}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600"
                      >
                        {c.patient.lastName} {c.patient.firstName}
                      </Link>
                      <span className="text-xs text-slate-400 ml-2 font-mono">
                        ({c.patient.patientNumber})
                      </span>
                      <p className="text-xs text-slate-500 font-medium">
                        Motif : <strong className="text-slate-700">{c.reason}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs text-slate-400 block">
                      {formatDate(c.consultationDate)}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Dr. {c.doctor.user.lastName} ({c.doctor.specialty.name})
                    </span>
                  </div>
                </div>

                {/* Vitals Summary */}
                {c.vitalSigns && (
                  <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-lg bg-slate-50 text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Constantes :</span>
                    {c.vitalSigns.temperature && <span>T°: <strong>{c.vitalSigns.temperature}°C</strong></span>}
                    {c.vitalSigns.systolicBP && <span>TA: <strong>{c.vitalSigns.systolicBP}/{c.vitalSigns.diastolicBP}</strong></span>}
                    {c.vitalSigns.heartRate && <span>FC: <strong>{c.vitalSigns.heartRate} bpm</strong></span>}
                    {c.vitalSigns.oxygenSaturation && <span>SpO2: <strong>{c.vitalSigns.oxygenSaturation}%</strong></span>}
                    {c.vitalSigns.weight && <span>Poids: <strong>{c.vitalSigns.weight} kg</strong></span>}
                    {c.vitalSigns.bmi && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        IMC {c.vitalSigns.bmi}
                      </span>
                    )}
                  </div>
                )}

                {/* Diagnostic & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase block">
                      Diagnostic posé
                    </span>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {c.diagnosis || 'Observation clinique consignée.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {c.prescription && (
                      <Link
                        href={`/prescriptions`}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        Ordonnance liée
                      </Link>
                    )}

                    <Link
                      href={`/patients/${c.patientId}`}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Dossier Patient
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
