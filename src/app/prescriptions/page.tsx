import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FileText, PlusCircle, Download, Printer, QrCode } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

export default async function PrescriptionsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const prescriptions = await prisma.prescription.findMany({
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
      items: true,
    },
    orderBy: { createdAt: 'desc' },
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
              <span className="text-slate-600 font-medium">Ordonnances</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Ordonnances Médicales ({prescriptions.length})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Prescriptions officielles avec QR Code de sécurité et export PDF
            </p>
          </div>

          <Link
            href="/prescriptions/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvelle Ordonnance</span>
          </Link>
        </div>

        {/* Prescriptions Cards Grid */}
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
              Aucune ordonnance émise pour le moment.
            </div>
          ) : (
            prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {rx.prescriptionNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Sécurisée • QR Code
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Patient :{' '}
                        <Link
                          href={`/patients/${rx.patientId}`}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          {rx.patient.lastName} {rx.patient.firstName}
                        </Link>{' '}
                        ({rx.patient.patientNumber})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="text-right hidden sm:block mr-2">
                      <span className="text-xs text-slate-400 block">{formatDate(rx.createdAt)}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        Dr. {rx.doctor.user.lastName} ({rx.doctor.specialty.name})
                      </span>
                    </div>

                    <a
                      href={`/api/prescriptions/${rx.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger PDF</span>
                    </a>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Médicaments :</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {rx.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="font-bold text-slate-800">
                          {item.medicineName} ({item.dosage})
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          {item.frequency} • {item.duration} (Qté : {item.quantity})
                        </p>
                        {item.instructions && (
                          <p className="text-slate-400 text-[10px] italic mt-0.5">
                            {item.instructions}
                          </p>
                        )}
                      </div>
                    ))}
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
