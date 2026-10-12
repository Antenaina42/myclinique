'use client';

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Upload,
  Trash2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  Building,
} from 'lucide-react';

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: any;
  patientId: string;
  patientName: string;
  onSuccess: () => void;
}

export default function AnalysisResultModal({
  isOpen,
  onClose,
  prescription,
  patientId,
  patientName,
  onSuccess,
}: AnalysisResultModalProps) {
  const [resultsDate, setResultsDate] = useState(new Date().toISOString().split('T')[0]);
  const [laboratory, setLaboratory] = useState('');
  const [resultsStatus, setResultsStatus] = useState<string>('COMPLETED');
  const [doctorComment, setDoctorComment] = useState('');
  const [photos, setPhotos] = useState<
    Array<{ url: string; fileName: string; fileSize?: number; mimeType?: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && prescription) {
      // Check existing metadata in doctorNotes
      try {
        if (prescription.doctorNotes && prescription.doctorNotes.startsWith('{')) {
          const meta = JSON.parse(prescription.doctorNotes);
          if (meta.resultsDate) setResultsDate(meta.resultsDate);
          if (meta.laboratory) setLaboratory(meta.laboratory);
          if (meta.resultsStatus) setResultsStatus(meta.resultsStatus);
          if (meta.doctorComment) setDoctorComment(meta.doctorComment);
          if (Array.isArray(meta.resultsPhotos)) {
            setPhotos(meta.resultsPhotos.map((p: any) => ({
              url: p.url || p.path,
              fileName: p.name || p.fileName || 'cliche_analyse.jpg',
              fileSize: p.size,
              mimeType: p.mime,
            })));
          }
        }
      } catch {
        // Normal notes string
      }
    }
  }, [isOpen, prescription]);

  if (!isOpen || !prescription) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    setIsUploading(true);
    setError('');

    try {
      const newFiles = [...photos];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'analyses');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du téléversement');
        }

        newFiles.push({
          url: data.url,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
        });
      }
      setPhotos(newFiles);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement des clichés');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // 1. Update prescription metadata
      const rxRes = await fetch(`/api/prescriptions/${prescription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultsPhotos: photos.map((p) => ({
            name: p.fileName,
            path: p.url,
            url: p.url,
            mime: p.mimeType,
            size: p.fileSize,
          })),
          resultsStatus,
          resultsDate,
          resultsNotes: doctorComment.trim(),
        }),
      });

      if (!rxRes.ok) {
        const rxData = await rxRes.json();
        throw new Error(rxData.error || "Erreur lors de la mise à jour de l'ordonnance");
      }

      // 2. Also register in PatientDocument if photo exists so it appears in Analyses tab too
      if (photos.length > 0) {
        const primaryFile = photos[0];
        const examSummary = prescription.items?.map((i: any) => i.medicineName).join(', ') || 'Analyses médicales';
        const statusLabel =
          resultsStatus === 'COMPLETED'
            ? 'Résultats reçus - Normaux'
            : resultsStatus === 'ABNORMAL'
            ? 'Anomalie(s) détectée(s)'
            : 'En attente';

        await fetch(`/api/patients/${patientId}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Résultats : ${examSummary}`,
            category: 'LAB_REPORT',
            fileUrl: primaryFile.url,
            fileType: primaryFile.mimeType || 'application/pdf',
            fileSize: primaryFile.fileSize || null,
            uploadedBy: laboratory.trim() || 'Laboratoire d’analyses',
            notes: `Rattaché à l'ordonnance ${prescription.prescriptionNumber}\nDate : ${resultsDate}\nStatut : ${statusLabel}\nAvis : ${doctorComment.trim()}`,
          }),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Résultats d'Analyses & Clichés
              </h2>
              <p className="text-xs text-slate-500">
                Ordonnance {prescription.prescriptionNumber} • Patient : {patientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Prescribed Items reminder */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">
              Examens prescrits dans cette ordonnance :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {prescription.items?.map((it: any, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold"
                >
                  {it.medicineName} {it.dosage && `(${it.dosage})`}
                </span>
              ))}
            </div>
          </div>

          {/* Date, Laboratory, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date des résultats *</label>
              <input
                type="date"
                required
                value={resultsDate}
                onChange={(e) => setResultsDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-medium outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Laboratoire</label>
              <input
                type="text"
                placeholder="ex: Laboratoire Central"
                value={laboratory}
                onChange={(e) => setLaboratory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-medium outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Statut</label>
              <select
                value={resultsStatus}
                onChange={(e) => setResultsStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-medium outline-none bg-white"
              >
                <option value="COMPLETED">✅ Reçus (Normaux)</option>
                <option value="ABNORMAL">⚠️ Anomalie détectée</option>
                <option value="PENDING">⏳ En attente labo</option>
              </select>
            </div>
          </div>

          {/* Avis & Conclusion */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Commentaire médical / Interprétation
            </label>
            <textarea
              rows={2}
              placeholder="Remarques du médecin, valeurs anormales constatées, conduite à tenir..."
              value={doctorComment}
              onChange={(e) => setDoctorComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 font-medium outline-none resize-none"
            />
          </div>

          {/* Photos and Scans Upload */}
          <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-purple-950">
                  <ImageIcon className="w-4 h-4 text-purple-700" />
                  <span>Photos / Clichés des Résultats ({photos.length})</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  Ajoutez les photos des feuilles d'analyse ou clichés scannés
                </p>
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white cursor-pointer shadow-xs transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>+ Ajouter une photo</span>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {isUploading && (
              <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-center gap-2 text-purple-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Téléversement en cours...</span>
              </div>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative group bg-white border border-slate-200 rounded-xl overflow-hidden p-2 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {photo.mimeType?.includes('image') || photo.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                        <img
                          src={photo.url}
                          alt={photo.fileName}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <span className="truncate text-[11px] font-semibold text-slate-800">
                        {photo.fileName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-md shadow-purple-700/20 disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer les résultats</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
