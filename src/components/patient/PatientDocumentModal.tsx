'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  FileImage,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PatientDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: (newDocument: any) => void;
}

const CATEGORIES = [
  { value: 'LAB_REPORT', label: 'Analyses & Bilan biologique' },
  { value: 'XRAY_IMAGING', label: 'Imagerie médicale & Radiographie' },
  { value: 'PRESCRIPTION', label: 'Ordonnance externe' },
  { value: 'MEDICAL_CERTIFICATE', label: 'Certificat médical' },
  { value: 'DISCHARGE_SUMMARY', label: "Compte-rendu d'hospitalisation" },
  { value: 'OTHER', label: 'Autre document administratif / médical' },
];

export default function PatientDocumentModal({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: PatientDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('LAB_REPORT');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title.trim()) {
        // Auto-fill title from filename without extension
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier à téléverser.');
      return;
    }
    if (!title.trim()) {
      setError('Veuillez renseigner un titre pour le document.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload file
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'documents');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Erreur lors du téléversement du fichier');
      }

      // 2. Create patient document record
      const docRes = await fetch(`/api/patients/${patientId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          fileUrl: uploadData.url,
          fileType: uploadData.mimeType,
          fileSize: uploadData.fileSize,
          notes: notes.trim() || null,
        }),
      });

      const docData = await docRes.json();
      if (!docRes.ok) {
        throw new Error(docData.error || "Erreur lors de l'enregistrement du document");
      }

      onSuccess(docData.document);
      onClose();
      // Reset state
      setTitle('');
      setCategory('LAB_REPORT');
      setNotes('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ajouter un Document au Dossier
              </h2>
              <p className="text-xs text-slate-500">
                Classement numérique sécurisé dans la bibliothèque du patient
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

          {/* File input / dropzone */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Fichier numérique *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-white shadow-2xs text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">
                    Cliquez pour choisir un fichier
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PDF, Photos (JPG, PNG), Documents (max 20 Mo)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    {file.type.includes('image') ? (
                      <FileImage className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} Mo • {file.type || 'Fichier'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Titre du document *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Bilan sanguin NFS du 12/10, Scanner thoracique..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catégorie de classement *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium outline-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Notes complémentaires / Observations
            </label>
            <textarea
              rows={3}
              placeholder="Remarques du praticien, laboratoire émetteur, conclusions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-medium outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer le document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
