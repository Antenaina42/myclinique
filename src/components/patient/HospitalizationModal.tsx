'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Stethoscope,
} from 'lucide-react';
import { HospitalizationItem } from '@/lib/clinicalMetadata';

interface HospitalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  hospitalizations: HospitalizationItem[];
  hospitalizationToEdit?: HospitalizationItem | null;
  onSuccess: (updatedList: HospitalizationItem[]) => void;
}

export default function HospitalizationModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  hospitalizations,
  hospitalizationToEdit,
  onSuccess,
}: HospitalizationModalProps) {
  const [hospitalName, setHospitalName] = useState('');
  const [service, setService] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [dischargeDate, setDischargeDate] = useState('');
  const [isStillHospitalized, setIsStillHospitalized] = useState(false);
  const [reason, setReason] = useState('');
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('AMELIORE');
  const [doctorInCharge, setDoctorInCharge] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (hospitalizationToEdit) {
        setHospitalName(hospitalizationToEdit.hospitalName || '');
        setService(hospitalizationToEdit.service || '');
        setAdmissionDate(
          hospitalizationToEdit.admissionDate
            ? hospitalizationToEdit.admissionDate.split('T')[0]
            : new Date().toISOString().split('T')[0]
        );
        if (hospitalizationToEdit.dischargeDate) {
          setDischargeDate(hospitalizationToEdit.dischargeDate.split('T')[0]);
          setIsStillHospitalized(false);
        } else {
          setDischargeDate('');
          setIsStillHospitalized(true);
        }
        setReason(hospitalizationToEdit.reason || '');
        setSummary(hospitalizationToEdit.summary || '');
        setOutcome(hospitalizationToEdit.outcome || 'AMELIORE');
        setDoctorInCharge(hospitalizationToEdit.doctorInCharge || '');
        setNotes(hospitalizationToEdit.notes || '');
      } else {
        setHospitalName('');
        setService('');
        setAdmissionDate(new Date().toISOString().split('T')[0]);
        setDischargeDate('');
        setIsStillHospitalized(false);
        setReason('');
        setSummary('');
        setOutcome('AMELIORE');
        setDoctorInCharge('');
        setNotes('');
      }
      setErrorMessage('');
    }
  }, [isOpen, hospitalizationToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!hospitalName.trim()) {
      setErrorMessage("Veuillez renseigner le nom de l'établissement hospitalier");
      return;
    }
    if (!reason.trim()) {
      setErrorMessage("Veuillez renseigner le motif d'hospitalisation");
      return;
    }

    setIsSaving(true);
    try {
      const entry: HospitalizationItem = {
        id: hospitalizationToEdit ? hospitalizationToEdit.id : `hosp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        hospitalName: hospitalName.trim(),
        service: service.trim() || null,
        admissionDate: new Date(admissionDate).toISOString(),
        dischargeDate: !isStillHospitalized && dischargeDate ? new Date(dischargeDate).toISOString() : null,
        reason: reason.trim(),
        summary: summary.trim() || null,
        outcome: isStillHospitalized ? 'EN_COURS' : outcome,
        doctorInCharge: doctorInCharge.trim() || null,
        notes: notes.trim() || null,
        files: hospitalizationToEdit?.files || [],
      };

      let updatedList: HospitalizationItem[];
      if (hospitalizationToEdit) {
        updatedList = hospitalizations.map((h) => (h.id === hospitalizationToEdit.id ? entry : h));
      } else {
        updatedList = [entry, ...hospitalizations];
      }

      const res = await fetch(`/api/patients/${patientId}/clinical-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalizations: updatedList }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      onSuccess(updatedList);
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
              <Building2 className="w-5 h-5 text-rose-600" />
              <span>{hospitalizationToEdit ? "Modifier le séjour hospitalier" : "Enregistrer une hospitalisation"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patient : <strong className="text-slate-800">{patientName}</strong>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Établissement / Clinique <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ex: Clinique des Orchidées, Hôpital HJRA..."
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Service / Département
              </label>
              <input
                type="text"
                placeholder="ex: Médecine Interne, Chirurgie, Soins Intensifs..."
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Date d'admission <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Date de sortie
                </label>
                <label className="flex items-center gap-1.5 text-xs text-rose-700 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStillHospitalized}
                    onChange={(e) => setIsStillHospitalized(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Toujours en cours</span>
                </label>
              </div>
              <input
                type="date"
                disabled={isStillHospitalized}
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Motif d'admission <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: Syndrome coronarien aigu, Décompensation respiratoire, Appendicectomie..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Issue clinique
              </label>
              <select
                disabled={isStillHospitalized}
                value={isStillHospitalized ? 'EN_COURS' : outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="AMELIORE">Amélioré / Sortie à domicile</option>
                <option value="GUERI">Guérison complète</option>
                <option value="STABILISE">État clinique stabilisé</option>
                <option value="TRANSFERE">Transféré dans un autre service/centre</option>
                <option value="EN_COURS">En cours d'hospitalisation</option>
                <option value="DECEDE">Décès au cours du séjour</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Médecin ou Praticien référent
              </label>
              <input
                type="text"
                placeholder="ex: Pr. Rakoto, Dr. Andry..."
                value={doctorInCharge}
                onChange={(e) => setDoctorInCharge(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Compte-rendu / Résumé d'hospitalisation
            </label>
            <textarea
              rows={3}
              placeholder="Évolution clinique, gestes chirurgicaux, traitements intraveineux, consignes de sortie..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-500/20 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{hospitalizationToEdit ? "Mettre à jour" : "Enregistrer le séjour"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
