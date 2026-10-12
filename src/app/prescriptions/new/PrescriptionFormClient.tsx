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
  Pill,
  FlaskConical,
  Upload,
  Image as ImageIcon,
  Clock,
  Home,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import PatientSelect from '@/components/ui/PatientSelect';

interface PrescriptionFormClientProps {
  patients: any[];
  doctors: any[];
  medicines: any[];
  initialPatientId: string;
  currentDoctorId: string;
}

interface CustomExamItem {
  name: string;
  indication: string;
  fasting: boolean;
  urgent: boolean;
  homeVisit: boolean;
}

const EXAM_PRESETS = [
  {
    name: 'Numération Formule Sanguine (NFS) + Plaquettes',
    indication: 'Bilan hématologique',
    fasting: false,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Protéine C-Réactive (CRP)',
    indication: 'Syndrome inflammatoire',
    fasting: false,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Glycémie veineuse à jeun + HbA1c',
    indication: 'Dépistage & suivi glycémique',
    fasting: true,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Bilan Lipidique complet (EAL - Cholestérol total, HDL, LDL, Triglycérides)',
    indication: 'Évaluation risque cardiovasculaire',
    fasting: true,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Créatininémie + Urée + Estimation DFG (CKD-EPI)',
    indication: 'Évaluation fonction rénale',
    fasting: false,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Ionogramme sanguin (Na+, K+, Cl-)',
    indication: 'Équilibre hydro-électrolytique',
    fasting: false,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Bilan Hépatique complet (ASAT, ALAT, GGT, Bilirubine)',
    indication: 'Fonction hépato-biliaire',
    fasting: true,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'TSH ultra-sensible',
    indication: 'Exploration thyroïdienne',
    fasting: false,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Examen Cytobactériologique des Urines (ECBU) + Antibiogramme',
    indication: 'Suspicion d’infection urinaire',
    fasting: false,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Radiographie pulmonaire face et profil',
    indication: 'Bilan respiratoire / toux persistante',
    fasting: false,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Échographie abdomino-pelvienne',
    indication: 'Douleurs abdominales',
    fasting: true,
    urgent: false,
    homeVisit: false,
  },
  {
    name: 'Prélèvement sanguin à domicile par IDE',
    indication: 'Patient à mobilité réduite',
    fasting: true,
    urgent: false,
    homeVisit: true,
  },
];

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

  // Type: Medication vs Analysis
  const [prescriptionType, setPrescriptionType] = useState<'MEDICATION' | 'EXAM_ANALYSIS'>('MEDICATION');

  const [patientId, setPatientId] = useState(initialPatientId || (patients[0]?.id || ''));
  const [doctorId, setDoctorId] = useState(currentDoctorId || (doctors[0]?.id || ''));

  // Medication fields
  const [doctorNotes, setDoctorNotes] = useState('Respecter scrupuleusement les doses et durées indiquées.');
  const [medItems, setMedItems] = useState<Array<{
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

  // Exam / Analysis fields
  const [examTitle, setExamTitle] = useState("PRESCRIPTION D'ANALYSES ET EXAMENS BIOLOGIQUES");
  const [labInstructions, setLabInstructions] = useState(
    'Prière de transmettre un double des résultats au médecin prescripteur.'
  );
  const [examDoctorNotes, setExamDoctorNotes] = useState('Effectuer les prélèvements dans les meilleurs délais.');
  const [examItems, setExamItems] = useState<CustomExamItem[]>([
    {
      name: 'Numération Formule Sanguine (NFS) + Plaquettes',
      indication: 'Bilan de santé / Bilan biologique',
      fasting: true,
      urgent: false,
      homeVisit: false,
    },
  ]);

  // Optional Result photo uploaded during prescription
  const [resultsPhotos, setResultsPhotos] = useState<
    Array<{ url: string; fileName: string; fileSize?: number; mimeType?: string }>
  >([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Add med item
  const addMedItem = () => {
    const defaultMed = medicines[0];
    setMedItems((prev) => [
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

  const removeMedItem = (idx: number) => {
    setMedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMedSelect = (idx: number, medId: string) => {
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;
    setMedItems((prev) => {
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

  // Add exam item
  const addExamItem = () => {
    setExamItems((prev) => [
      ...prev,
      {
        name: '',
        indication: '',
        fasting: false,
        urgent: false,
        homeVisit: false,
      },
    ]);
  };

  const removeExamItem = (idx: number) => {
    setExamItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addPresetExam = (preset: typeof EXAM_PRESETS[0]) => {
    const exists = examItems.some((e) => e.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) return;
    setExamItems((prev) => [
      ...prev.filter((e) => e.name.trim() !== ''),
      { ...preset },
    ]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    setIsUploadingPhoto(true);

    try {
      const newFiles = [...resultsPhotos];
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
        if (res.ok) {
          newFiles.push({
            url: data.url,
            fileName: data.fileName,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
          });
        }
      }
      setResultsPhotos(newFiles);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Veuillez sélectionner un patient.');
      return;
    }
    if (!doctorId) {
      setError('Veuillez sélectionner un médecin prescripteur.');
      return;
    }

    setLoading(true);

    try {
      let payloadItems: any[] = [];
      let finalDoctorNotes = '';

      if (prescriptionType === 'MEDICATION') {
        if (!medItems.length) {
          setError('Veuillez ajouter au moins un médicament.');
          setLoading(false);
          return;
        }
        payloadItems = medItems;
        finalDoctorNotes = doctorNotes;
      } else {
        // Exam analysis
        const validExams = examItems.filter((ex) => ex.name.trim() !== '');
        if (!validExams.length) {
          setError('Veuillez ajouter au moins une analyse ou un examen médical.');
          setLoading(false);
          return;
        }

        payloadItems = validExams.map((ex) => ({
          medicineName: ex.name.trim(),
          dosage: ex.fasting ? 'À jeun' : 'Non à jeun',
          form: 'Examen biologique',
          quantity: 1,
          frequency: ex.urgent ? 'URGENT' : 'Normal',
          duration: ex.homeVisit ? 'À domicile' : 'En cabinet/labo',
          instructions: ex.indication || labInstructions || 'Selon protocole',
        }));

        finalDoctorNotes = JSON.stringify({
          type: 'EXAM_ANALYSIS',
          examTitle,
          labInstructions,
          doctorComment: examDoctorNotes,
          resultsPhotos: resultsPhotos.map((p) => ({
            name: p.fileName,
            path: p.url,
            url: p.url,
            mime: p.mimeType,
            size: p.fileSize,
          })),
        });
      }

      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          doctorNotes: finalDoctorNotes,
          items: payloadItems,
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
      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-md text-center space-y-4 max-w-xl mx-auto my-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Ordonnance émise avec succès !
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {prescriptionType === 'EXAM_ANALYSIS'
            ? 'La prescription d’analyses et examens a été rattachée au dossier du patient. Vous pouvez télécharger le document officiel.'
            : 'L’ordonnance médicamenteuse a été validée et enregistrée. Vous pouvez télécharger le document officiel au format PDF.'}
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
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TOP TOGGLE: TYPE D'ORDONNANCE (DoctorDesk style) */}
      <div className="p-2 bg-slate-100 rounded-2xl flex items-center gap-2 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setPrescriptionType('MEDICATION')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            prescriptionType === 'MEDICATION'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Médicaments</span>
        </button>

        <button
          type="button"
          onClick={() => setPrescriptionType('EXAM_ANALYSIS')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            prescriptionType === 'EXAM_ANALYSIS'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Analyses & Examens</span>
        </button>
      </div>

      {/* Destinataire & Praticien Prescripteur */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            Destinataire & Praticien Prescripteur
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <PatientSelect
              patients={patients}
              value={patientId}
              onChange={(id) => setPatientId(id)}
              label="Patient"
              required={true}
              placeholder="Rechercher par nom, n° patient ou téléphone..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Médecin Prescripteur *
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
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

      {/* ======================================================== */}
      {/* MODE 1: MÉDICAMENTS                                      */}
      {/* ======================================================== */}
      {prescriptionType === 'MEDICATION' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
              Médicaments Prescrits ({medItems.length})
            </h2>
            <button
              type="button"
              onClick={addMedItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une ligne</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {medItems.map((it, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700">Ligne #{idx + 1}</span>
                  {medItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">
                      Médicament (Stock pharmacie)
                    </label>
                    <select
                      value={it.medicineId}
                      onChange={(e) => handleMedSelect(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                    >
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.genericName}) — {m.dosage} [{m.form}] (En stock : {m.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Quantité (boîtes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value || '1', 10);
                        setMedItems((prev) => {
                          const copy = [...prev];
                          copy[idx].quantity = val;
                          return copy;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Posologie / Fréquence
                    </label>
                    <input
                      type="text"
                      value={it.frequency}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMedItems((prev) => {
                          const copy = [...prev];
                          copy[idx].frequency = val;
                          return copy;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Durée</label>
                    <input
                      type="text"
                      value={it.duration}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMedItems((prev) => {
                          const copy = [...prev];
                          copy[idx].duration = val;
                          return copy;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Instructions
                    </label>
                    <input
                      type="text"
                      value={it.instructions}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMedItems((prev) => {
                          const copy = [...prev];
                          copy[idx].instructions = val;
                          return copy;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200"
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
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: ANALYSES ET EXAMENS MÉDICAUX (DoctorDesk Style)   */}
      {/* ======================================================== */}
      {prescriptionType === 'EXAM_ANALYSIS' && (
        <div className="space-y-4">
          {/* Quick Presets Grid */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Sélection rapide de bilans fréquents (Presets DoctorDesk)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Cliquez pour ajouter instantanément un examen biologique ou radiologique pré-configuré :
            </p>

            <div className="flex flex-wrap gap-2">
              {EXAM_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addPresetExam(preset)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3 text-emerald-600" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exam items list */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                Analyses & Examens Prescrits ({examItems.length})
              </h2>
              <button
                type="button"
                onClick={addExamItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un examen</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {examItems.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">
                      Examen #{idx + 1}
                    </span>
                    {examItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExamItem(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Intitulé de l'analyse / examen *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: NFS, Glycémie veineuse, Scanner..."
                        value={ex.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamItems((prev) => {
                            const copy = [...prev];
                            copy[idx].name = val;
                            return copy;
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Indication médicale
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Suspicion d'infection, Bilan préopératoire..."
                        value={ex.indication}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExamItems((prev) => {
                            const copy = [...prev];
                            copy[idx].indication = val;
                            return copy;
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Conditions checkboxes */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={ex.fasting}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setExamItems((prev) => {
                            const copy = [...prev];
                            copy[idx].fasting = checked;
                            return copy;
                          });
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>🩸 À jeun impératif</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={ex.urgent}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setExamItems((prev) => {
                            const copy = [...prev];
                            copy[idx].urgent = checked;
                            return copy;
                          });
                        }}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-rose-700">⚡ Urgent</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={ex.homeVisit}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setExamItems((prev) => {
                            const copy = [...prev];
                            copy[idx].homeVisit = checked;
                            return copy;
                          });
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>🏠 Prélèvement à domicile</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions pour le laboratoire */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions pour le laboratoire
                </label>
                <input
                  type="text"
                  value={labInstructions}
                  onChange={(e) => setLabInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recommandations au patient
                </label>
                <input
                  type="text"
                  value={examDoctorNotes}
                  onChange={(e) => setExamDoctorNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Photos & Scans upload (Directement sur l'analyse comme DoctorDesk) */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Cliché / Photo du résultat d'analyse (Optionnel)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Si le patient a déjà les feuilles de résultats, vous pouvez joindre la photo directement ici
                  </p>
                </div>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Joindre photo/scan</span>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {isUploadingPhoto && (
                <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-emerald-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Téléversement de la photo...</span>
                </div>
              )}

              {resultsPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {resultsPhotos.map((photo, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={photo.url}
                          alt="preview"
                          className="w-7 h-7 rounded object-cover border"
                        />
                        <span className="truncate text-[11px] font-medium">{photo.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResultsPhotos((prev) => prev.filter((_, i) => i !== pIdx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-60 transition-colors ${
            prescriptionType === 'EXAM_ANALYSIS'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
          }`}
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
