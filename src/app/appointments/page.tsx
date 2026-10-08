import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Calendar as CalendarIcon, PlusCircle, Clock, User, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate, getStatusBadge } from '@/lib/formatters';
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const appointments = await prisma.appointment.findMany({
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
    },
    orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
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
              <span className="text-slate-600 font-medium">Rendez-vous</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Calendrier & Rendez-vous Médicaux ({appointments.length})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Planning des consultations, gestion des présences et file d'attente
            </p>
          </div>

          <Link
            href="/appointments/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau Rendez-vous</span>
          </Link>
        </div>

        <AppointmentsClient initialAppointments={appointments} />
      </div>
    </DashboardLayout>
  );
}
