'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, Stethoscope, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AppointmentFormClientProps {
  patients: any[];
  doctors: any[];
}

export default function AppointmentFormClient({ patients, doctors }: AppointmentFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('09:00');
  const [reason, setReason] = useState('Consultation de médecine générale');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          appointmentDate,
          startTime,
          reason,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la prise de rendez-vous');
        setLoading(false);
        return;
      }

      router.push('/appointments');
      router.refresh();
    } catch (err: any) {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Patient *</label>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.lastName} {p.firstName} ({p.patientNumber})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Médecin Praticien *</label>
        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              Dr. {d.user.lastName} {d.user.firstName} ({d.specialty.name})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Date du rendez-vous *</label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Heure de passage *</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Motif de la visite *</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          placeholder="ex: Douleurs abdominales aiguës..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Instructions / Remarques</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ex: Venir à jeun pour prise de sang..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link
          href="/appointments"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Annuler</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-500/20 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirmation...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Confirmer le RDV</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
