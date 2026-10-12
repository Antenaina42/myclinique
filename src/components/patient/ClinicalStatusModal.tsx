'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Heart,
  Skull,
  X,
  Pill,
} from 'lucide-react';
import { ClinicalStatus } from '@/lib/clinicalMetadata';

interface ClinicalStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    patientNumber?: string | null;
    firstName: string;
    lastName: string;
  };
  currentStatus?: ClinicalStatus;
  currentStatusDate?: string | null;
  currentDeathDate?: string | null;
  currentDeathCause?: string | null;
  currentTreatmentNotes?: string | null;
  onSuccess: (updated: {
    clinicalStatus: ClinicalStatus;
    clinicalStatusDate: string;
    deathDate: string | null;
    deathCause: string | null;
    treatmentResultNotes: string | null;
  }) => void;
}

const STATUS_OPTIONS: {
  status: ClinicalStatus;
  label: string;
  desc: string;
  color: string;
  icon: any;
}[] = [
  {
    status: 'SOIGNE',
    label: 'Soigné / Guéri',
    desc: "L'épisode pathologique est résolu, traitement terminé avec succès.",
    color: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    icon: CheckCircle2,
  },
  {
    status: 'EN_TRAITEMENT',
    label: 'En cours de traitement',
    desc: 'Prise en charge active, posologie ou examens complémentaires en cours.',
    color: 'border-blue-300 bg-blue-50 text-blue-800',
    icon: Pill,
  },
  {
    status: 'STABLE',
    label: 'Affection stabilisée',
    desc: 'Maladie chronique équilibrée sous traitement régulier (HTA, diabète...).',
    color: 'border-purple-300 bg-purple-50 text-purple-800',
    icon: Heart,
  },
  {
    status: 'RECHUTE',
    label: 'Rechute clinique',
    desc: 'Réapparition des symptômes après rémission ou échec thérapeutique.',
    color: 'border-amber-300 bg-amber-50 text-amber-800',
    icon: RotateCcw,
  },
  {
    status: 'COMPLICATION',
    label: 'Complication',
    desc: "Aggravation clinique ou survenue d'un événement indésirable lié à la pathologie.",
    color: 'border-orange-300 bg-orange-50 text-orange-800',
    icon: AlertTriangle,
  },
  {
    status: 'DECEDE',
    label: 'Décédé(e)',
    desc: 'Patient décédé. Clôture administrative et médicale du dossier.',
    color: 'border-slate-800 bg-slate-900 text-slate-100',
    icon: Skull,
  },
];

export default function ClinicalStatusModal({
  isOpen,
  onClose,
  patient,
  currentStatus = 'EN_TRAITEMENT',
  currentStatusDate,
  currentDeathDate,
  currentDeathCause,
  currentTreatmentNotes,
  onSuccess,
}: ClinicalStatusModalProps) {
  const [clinicalStatus, setClinicalStatus] = useState<ClinicalStatus>(currentStatus);
  const [clinicalStatusDate, setClinicalStatusDate] = useState<string>(
    currentStatusDate
      ? currentStatusDate.split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [deathDate, setDeathDate] = useState<string>(currentDeathDate || '');
  const [deathCause, setDeathCause] = useState<string>(currentDeathCause || '');
  const [treatmentResultNotes, setTreatmentResultNotes] = useState<string>(
    currentTreatmentNotes || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setClinicalStatus(currentStatus || 'EN_TRAITEMENT');
      setClinicalStatusDate(
        currentStatusDate
          ? currentStatusDate.split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDeathDate(currentDeathDate || '');
      setDeathCause(currentDeathCause || '');
      setTreatmentResultNotes(currentTreatmentNotes || '');
      setErrorMessage('');
    }
  }, [isOpen, currentStatus, currentStatusDate, currentDeathDate, currentDeathCause, currentTreatmentNotes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (clinicalStatus === 'DECEDE' && !deathDate) {
      setErrorMessage('Veuillez renseigner la date de décès');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        clinicalStatus,
        clinicalStatusDate: new Date(clinicalStatusDate).toISOString(),
        deathDate: clinicalStatus === 'DECEDE' ? deathDate : null,
        deathCause: clinicalStatus === 'DECEDE' ? deathCause.trim() : null,
        treatmentResultNotes: treatmentResultNotes.trim() || null,
      };

      const res = await fetch(`/api/patients/${patient.id}/clinical-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      onSuccess(payload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Issue du Traitement & État Clinique</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patient : <strong className="text-slate-800">{patient.lastName} {patient.firstName}</strong>
              {patient.patientNumber && ` (${patient.patientNumber})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Choix du statut */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              Sélectionnez l'état clinique actuel du patient
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = clinicalStatus === opt.status;
                return (
                  <button
                    type="button"
                    key={opt.status}
                    onClick={() => setClinicalStatus(opt.status)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? `${opt.color} shadow-sm ring-2 ring-blue-500`
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{opt.label}</span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-snug ${isSelected && opt.status === 'DECEDE' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date d'évaluation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Date d'évaluation / changement d'état
            </label>
            <input
              type="date"
              required
              value={clinicalStatusDate}
              onChange={(e) => setClinicalStatusDate(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Champs si Décédé */}
          {clinicalStatus === 'DECEDE' && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md border border-slate-800">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-rose-300">
                <Skull className="w-4 h-4 text-rose-400" />
                <span>Informations de décès du patient</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Date du décès <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Cause du décès
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Arrêt cardio-respiratoire, Choc septique..."
                    value={deathCause}
                    onChange={(e) => setDeathCause(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Observations sur l'évolution & l'issue du traitement
            </label>
            <textarea
              rows={3}
              value={treatmentResultNotes}
              onChange={(e) => setTreatmentResultNotes(e.target.value)}
              placeholder="Détails sur la réponse aux thérapeutiques (bonne tolérance, régression des symptômes, arrêt des traitements...)"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer l'état du patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
