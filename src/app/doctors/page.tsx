import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { UserCheck, Phone, Stethoscope, Calendar, Clock, Award } from 'lucide-react';

export default async function DoctorsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: session.clinicId },
    include: {
      user: true,
      specialty: true,
      _count: {
        select: {
          consultations: true,
          appointments: true,
          prescriptions: true,
        },
      },
    },
    orderBy: { user: { lastName: 'asc' } },
  });

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
              <span>/</span>
              <span className="text-slate-600 font-medium">Médecins</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Corps Médical & Spécialistes ({doctors.length})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Praticiens hospitaliers, numéros d'ordre et planning de consultation
            </p>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-lg flex items-center justify-center shrink-0 border border-blue-200">
                    Dr
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Dr. {doc.user.firstName} {doc.user.lastName}
                    </h3>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1">
                      {doc.specialty.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                      N° Ordre : {doc.licenseNumber}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                  {doc.bio || 'Médecin praticien hospitalier de la clinique.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.workingHours || 'Lun - Ven: 08h00 - 17h00'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.phone || doc.user.phone || '+261 34 00 000 00'}</span>
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">
                    {doc._count.consultations}
                  </span>
                  <span className="text-[10px] text-slate-400">Consult.</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block">
                    {doc._count.appointments}
                  </span>
                  <span className="text-[10px] text-slate-400">RDV</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block">
                    {doc._count.prescriptions}
                  </span>
                  <span className="text-[10px] text-slate-400">Ordonnances</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
