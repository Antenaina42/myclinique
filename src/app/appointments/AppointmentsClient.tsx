'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Stethoscope, User, Check, X, AlertCircle } from 'lucide-react';
import { formatDate, getStatusBadge } from '@/lib/formatters';

interface AppointmentsClientProps {
  initialAppointments: any[];
}

export default function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filter, setFilter] = useState('ALL');

  const filtered = appointments.filter((apt) => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              filter === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL'
              ? 'Tous les RDV'
              : st === 'CONFIRMED'
              ? 'Confirmés'
              : st === 'IN_PROGRESS'
              ? 'Patient arrivé / En cours'
              : st === 'PENDING'
              ? 'En attente'
              : st === 'COMPLETED'
              ? 'Terminés'
              : 'Annulés'}
          </button>
        ))}
      </div>

      {/* Appointments List Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            Aucun rendez-vous ne correspond à ce filtre.
          </div>
        ) : (
          filtered.map((apt) => {
            const badge = getStatusBadge(apt.status);
            return (
              <div
                key={apt.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs flex flex-col items-center justify-center shrink-0 border border-blue-100">
                    <Clock className="w-4 h-4 mb-0.5" />
                    <span>{apt.startTime}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/patients/${apt.patientId}`}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600"
                      >
                        {apt.patient.lastName} {apt.patient.firstName}
                      </Link>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Motif : <span className="text-slate-700">{apt.reason}</span>
                    </p>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Dr. {apt.doctor.user.lastName} ({apt.doctor.specialty.name}) • Date : {formatDate(apt.appointmentDate)}
                    </p>
                  </div>
                </div>

                {/* Status Switcher Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  {apt.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(apt.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      Patient arrivé
                    </button>
                  )}

                  {apt.status === 'IN_PROGRESS' && (
                    <Link
                      href={`/consultations/new?patientId=${apt.patientId}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Lancer Consultation</span>
                    </Link>
                  )}

                  {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Annuler le rendez-vous"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
