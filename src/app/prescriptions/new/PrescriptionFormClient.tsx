'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  User,
  Stethoscope,
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  Download,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface PrescriptionFormClientProps {
  patients: any[];
  doctors: any[];
  medicines: any[];
  initialPatientId: string;
  currentDoctorId: string;
}

export default function PrescriptionFormClient({
  patients,
  doctors,
  medicines,
  initialPatientId,
  currentDoctorId,
}: PrescriptionFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRxId, setCreatedRxId] = useState<string | null>(null);

  const [patientId, setPatientId] = useState(initialPatientId || (patients[0]?.id || ''));
  const [doctorId, setDoctorId] = useState(currentDoctorId || (doctors[0]?.id || ''));
  const [doctorNotes, setDoctorNotes] = useState('Respecter scrupuleusement les doses et durées indiquées.');

  const [items, setItems] = useState<Array<{
    medicineId: string;
    medicineName: string;
    dosage: string;
    form: string;
    quantity: number;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([
    {
      medicineId: medicines[0]?.id || '',
      medicineName: medicines[0]?.name || '',
      dosage: medicines[0]?.dosage || '',
      form: medicines[0]?.form || 'Comprimé',
      quantity: 1,
      frequency: '1 comprimé 3 fois par jour',
      duration: 'Pendant 5 jours',
      instructions: 'Au cours des repas avec un grand verre d’eau',
    },
  ]);

  const addItem = () => {
    const defaultMed = medicines[0];
    setItems((prev) => [
      ...prev,
      {
        medicineId: defaultMed?.id || '',
        medicineName: defaultMed?.name || '',
        dosage: defaultMed?.dosage || '',
        form: defaultMed?.form || 'Comprimé',
        quantity: 1,
        frequency: '1 comprimé matin et soir',
        duration: 'Pendant 7 jours',
        instructions: 'Après le repas',
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMedSelect = (idx: number, medId: string) => {
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.dosage,
        form: med.form,
      };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          doctorNotes,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l’émission de l’ordonnance.');
        setLoading(false);
        return;
      }

      setCreatedRxId(data.prescription.id);
      setLoading(false);
    } catch (err: any) {
      setError('Erreur serveur : ' + err.message);
      setLoading(false);
    }
  };

  if (createdRxId) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Ordonnance émise avec succès !
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          L'ordonnance a été rattachée au dossier du patient et signée électroniquement. Vous pouvez télécharger directement le document officiel au format PDF.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <a
            href={`/api/prescriptions/${createdRxId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le PDF officiel</span>
          </a>

          <Link
            href={`/patients/${patientId}`}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Retour au dossier patient
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Patient & Doctor */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            Destinataire & Praticien Prescripteur
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
            <label className="block font-semibold text-slate-700 mb-1">Médecin Prescripteur *</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.user.lastName} {doc.user.firstName} ({doc.specialty.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Prescription Items */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            Médicaments Prescrits ({items.length})
          </h2>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une ligne</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {items.map((it, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700">Ligne #{idx + 1}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Médicament (Stock pharmacie)</label>
                  <select
                    value={it.medicineId}
                    onChange={(e) => handleMedSelect(idx, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.genericName}) — {m.dosage} [{m.form}] (En stock : {m.currentStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Quantité (boîtes)</label>
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value || '1', 10);
                      setItems((prev) => {
                        const copy = [...prev];
                        copy[idx].quantity = val;
                        return copy;
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Posologie / Fréquence</label>
                  <input
                    type="text"
                    value={it.frequency}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItems((prev) => {
                        const copy = [...prev];
                        copy[idx].frequency = val;
                        return copy;
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Durée</label>
                  <input
                    type="text"
                    value={it.duration}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItems((prev) => {
                        const copy = [...prev];
                        copy[idx].duration = val;
                        return copy;
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Instructions</label>
                  <input
                    type="text"
                    value={it.instructions}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItems((prev) => {
                        const copy = [...prev];
                        copy[idx].instructions = val;
                        return copy;
                      });
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Recommandations / Notes du médecin
          </label>
          <textarea
            rows={2}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/prescriptions"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Annuler</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Émettre et Générer PDF</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
