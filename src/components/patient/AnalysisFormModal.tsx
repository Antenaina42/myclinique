'use client';

import React, { useState } from 'react';
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
  Link as LinkIcon,
  Calendar,
  Building,
} from 'lucide-react';

interface AnalysisFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  prescriptions: any[];
  onSuccess: (newDocument: any) => void;
}

const CATEGORIES = [
  { key: 'HEMATOLOGY', label: '🩸 Hématologie (NFS)', docCategory: 'LAB_REPORT' },
  { key: 'BIOCHEMISTRY', label: '🧪 Biochimie & Glycémie', docCategory: 'LAB_REPORT' },
  { key: 'LIPIDS', label: '🫀 Bilan lipidique (EAL)', docCategory: 'LAB_REPORT' },
  { key: 'RENAL', label: '💧 Bilan rénal & Ionogramme', docCategory: 'LAB_REPORT' },
  { key: 'LIVER', label: '🩺 Bilan hépatique', docCategory: 'LAB_REPORT' },
  { key: 'HORMONES', label: '🧬 Hormonologie / TSH', docCategory: 'LAB_REPORT' },
  { key: 'URINE', label: '🧫 ECBU (Urine)', docCategory: 'LAB_REPORT' },
  { key: 'IMAGING', label: '🩻 Radiologie & Imagerie', docCategory: 'XRAY_IMAGING' },
  { key: 'OTHER', label: '🔬 Autre analyse médicale', docCategory: 'LAB_REPORT' },
];

export default function AnalysisFormModal({
  isOpen,
  onClose,
  patientId,
  prescriptions = [],
  onSuccess,
}: AnalysisFormModalProps) {
  const [categoryKey, setCategoryKey] = useState('BIOCHEMISTRY');
  const [title, setTitle] = useState('Bilan Biochimique');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [laboratory, setLaboratory] = useState('');
  const [doctorComment, setDoctorComment] = useState('');
  const [status, setStatus] = useState<'COMPLETED' | 'ABNORMAL' | 'PENDING'>('COMPLETED');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>('NONE');

  // Uploaded photos / documents
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; fileName: string; fileSize?: number; mimeType?: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
    setCategoryKey(cat.key);
    setTitle(cat.label.replace(/^[^a-zA-ZÀ-ÿ0-9]+/g, '').split('(')[0].trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    setIsUploading(true);
    setError('');

    try {
      const newFiles = [...uploadedFiles];
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
      setUploadedFiles(newFiles);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléversement des fichiers');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Veuillez renseigner le titre du bilan ou examen.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const activeCat = CATEGORIES.find((c) => c.key === categoryKey) || CATEGORIES[1];
      const primaryUrl = uploadedFiles[0]?.url || '/placeholder-doc.pdf';

      // Build structured notes
      const statusLabel =
        status === 'COMPLETED'
          ? 'Résultats reçus - Normaux'
          : status === 'ABNORMAL'
          ? 'Anomalie(s) détectée(s)'
          : 'En attente des résultats';

      const linkedRx = prescriptions.find((p) => p.id === selectedPrescriptionId);
      const linkedRxText = linkedRx
        ? `Rattaché à l'ordonnance ${linkedRx.prescriptionNumber}`
        : 'À titre informatif (Sans ordonnance rattachée)';

      let fullNotes = `Date de réalisation : ${date}\n`;
      if (laboratory.trim()) fullNotes += `Laboratoire : ${laboratory.trim()}\n`;
      fullNotes += `Statut : ${statusLabel}\n`;
      fullNotes += `Rattachement : ${linkedRxText}\n`;
      if (doctorComment.trim()) fullNotes += `\nAvis du praticien : ${doctorComment.trim()}\n`;

      if (uploadedFiles.length > 0) {
        fullNotes += `\nFichiers attachés :\n${JSON.stringify(uploadedFiles)}`;
      }

      // 1. Save patient document
      const docRes = await fetch(`/api/patients/${patientId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category: activeCat.docCategory,
          fileUrl: primaryUrl,
          fileType: uploadedFiles[0]?.mimeType || 'application/pdf',
          fileSize: uploadedFiles[0]?.fileSize || null,
          uploadedBy: laboratory.trim() || 'Biologie médicale',
          notes: fullNotes,
        }),
      });

      const docData = await docRes.json();
      if (!docRes.ok) {
        throw new Error(docData.error || "Erreur lors de l'enregistrement de l'analyse");
      }

      // 2. If linked to an ordonnance, update the prescription's metadata
      if (selectedPrescriptionId && selectedPrescriptionId !== 'NONE') {
        try {
          await fetch(`/api/prescriptions/${selectedPrescriptionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resultsPhotos: uploadedFiles.map((f) => ({
                name: f.fileName,
                path: f.url,
                url: f.url,
                mime: f.mimeType,
                size: f.fileSize,
              })),
              resultsStatus: status,
              resultsDate: date,
              resultsNotes: `${doctorComment.trim()} (Labo : ${laboratory.trim() || 'N/A'})`,
            }),
          });
        } catch (rxErr) {
          console.warn('Could not update linked prescription:', rxErr);
        }
      }

      onSuccess(docData.document);
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
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Saisir des Résultats d'Analyses Médicales
              </h2>
              <p className="text-xs text-slate-500">
                Enregistrement avec clichés/scans des résultats et avis du médecin
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Categories Buttons */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Type d'analyse / Bilan biologique
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    categoryKey === cat.key
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title, Date, Lab */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Intitulé de l'examen / bilan *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Bilan Lipidique Complet, NFS, CRP..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date d'analyse *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Laboratoire d'analyses
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ex: Laboratoire Central, Pasteur..."
                  value={laboratory}
                  onChange={(e) => setLaboratory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Statut des résultats
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium outline-none bg-white"
              >
                <option value="COMPLETED">✅ Résultats reçus (Normaux)</option>
                <option value="ABNORMAL">⚠️ Anomalie(s) détectée(s)</option>
                <option value="PENDING">⏳ En attente de validation</option>
              </select>
            </div>
          </div>

          {/* Rattachement à une Ordonnance ou À titre informatif */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <label className="font-bold text-slate-800">
                Rattachement à une ordonnance d'analyse
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              Vous pouvez soit lier ces résultats à une ordonnance existante pour clore la prescription, soit les enregistrer à titre informatif.
            </p>

            <select
              value={selectedPrescriptionId}
              onChange={(e) => setSelectedPrescriptionId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium outline-none bg-white"
            >
              <option value="NONE">
                ℹ️ À titre informatif (Aucune ordonnance rattachée)
              </option>
              {prescriptions.map((rx) => (
                <option key={rx.id} value={rx.id}>
                  📄 {rx.prescriptionNumber} du {new Date(rx.createdAt).toLocaleDateString('fr-FR')} - {rx.items?.map((i: any) => i.medicineName).slice(0, 3).join(', ')}
                </option>
              ))}
            </select>
          </div>

          {/* Avis & Conclusion Médicale */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Avis médical & Interprétation du praticien
            </label>
            <textarea
              rows={2}
              placeholder="ex: Paramètres hématologiques dans les normes. Légère anémie microcytaire à surveiller..."
              value={doctorComment}
              onChange={(e) => setDoctorComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium outline-none resize-none"
            />
          </div>

          {/* Photos & Scans Attachments */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Photos & Scans des Résultats ({uploadedFiles.length})</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Prenez en photo ou joignez les feuilles de résultats remises par le laboratoire
                </p>
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs transition-colors">
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
              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-center gap-2 text-emerald-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Téléversement des fichiers en cours...</span>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group bg-white border border-slate-200 rounded-xl overflow-hidden p-2 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {file.mimeType?.includes('image') || file.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                        <img
                          src={file.url}
                          alt={file.fileName}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <span className="truncate text-[11px] font-semibold text-slate-800">
                        {file.fileName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit buttons */}
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
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
