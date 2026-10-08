'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  HeartPulse,
  Activity,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { calculateAge, calculateBMI } from '@/lib/formatters';

interface ConsultationFormClientProps {
  patients: any[];
  doctors: any[];
  medicines: any[];
  initialPatientId: string;
  currentDoctorId: string;
}

export default function ConsultationFormClient({
  patients,
  doctors,
  medicines,
  initialPatientId,
  currentDoctorId,
}: ConsultationFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [patientId, setPatientId] = useState(initialPatientId || (patients[0]?.id || ''));
  const [doctorId, setDoctorId] = useState(currentDoctorId || (doctors[0]?.id || ''));

  // Vitals
  const [vitals, setVitals] = useState({
    temperature: '37.0',
    systolicBP: '120',
    diastolicBP: '80',
    heartRate: '75',
    oxygenSaturation: '99',
    weight: '70',
    height: '170',
  });

  // Clinical text
  const [reason, setReason] = useState('Consultation de médecine générale');
  const [symptoms, setSymptoms] = useState('');
  const [physicalExamination, setPhysicalExamination] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // Prescription toggle
  const [createPrescription, setCreatePrescription] = useState(false);
  const [rxItems, setRxItems] = useState<Array<{
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
      medicineName: medicines[0]?.name || 'Doliprane 1000 mg',
      dosage: medicines[0]?.dosage || '1000 mg',
      form: medicines[0]?.form || 'Comprimé',
      quantity: 1,
      frequency: '3 fois par jour',
      duration: 'Pendant 5 jours',
      instructions: 'Après les repas avec un grand verre d’eau',
    },
  ]);

  // Selected Patient Details
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === patientId);
  }, [patients, patientId]);

  // Live BMI Calculation
  const bmiInfo = useMemo(() => {
    const w = parseFloat(vitals.weight);
    const h = parseFloat(vitals.height);
    return calculateBMI(w, h);
  }, [vitals.weight, vitals.height]);

  const addRxItem = () => {
    const defaultMed = medicines[0];
    setRxItems((prev) => [
      ...prev,
      {
        medicineId: defaultMed?.id || '',
        medicineName: defaultMed?.name || '',
        dosage: defaultMed?.dosage || '',
        form: defaultMed?.form || 'Comprimé',
        quantity: 1,
        frequency: '2 fois par jour',
        duration: 'Pendant 7 jours',
        instructions: 'Au cours des repas',
      },
    ]);
  };

  const removeRxItem = (index: number) => {
    setRxItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, medId: string) => {
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;
    setRxItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.dosage,
        form: med.form,
      };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Create Consultation
      const consultRes = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          reason,
          symptoms,
          physicalExamination,
          diagnosis,
          treatment,
          doctorNotes,
          vitals,
        }),
      });

      const consultData = await consultRes.json();
      if (!consultRes.ok) {
        setError(consultData.error || 'Erreur enregistrement consultation.');
        setLoading(false);
        return;
      }

      // 2. If prescription requested, create prescription linked to consultation
      if (createPrescription && rxItems.length > 0) {
        await fetch('/api/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            doctorId,
            consultationId: consultData.consultation.id,
            doctorNotes,
            items: rxItems,
          }),
        });
      }

      setSuccess('Consultation médicale enregistrée avec succès !');
      setTimeout(() => {
        router.push(`/patients/${patientId}`);
      }, 1000);
    } catch (err: any) {
      setError('Erreur de communication serveur : ' + err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Patient & Doctor Selection */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            1. Patient & Praticien
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sélectionner le Patient *</label>
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
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.user.lastName} {doc.user.firstName} ({doc.specialty.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Patient Medical Summary Badge */}
        {selectedPatient && (
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-blue-900">
                {selectedPatient.lastName} {selectedPatient.firstName}
              </span>
              <span className="text-slate-500">
                {calculateAge(selectedPatient.birthDate)} ans • {selectedPatient.gender === 'FEMALE' ? 'Femme' : 'Homme'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                {selectedPatient.bloodGroup || 'O+'}
              </span>
            </div>

            {selectedPatient.medicalRecord?.allergies && (
              <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Allergies : {selectedPatient.medicalRecord.allergies}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Constantes Vitales & IMC */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
              2. Prise des Constantes Vitales
            </h2>
          </div>
          {bmiInfo && (
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${bmiInfo.color}`}>
              IMC : {bmiInfo.bmi} kg/m² ({bmiInfo.category})
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Température</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-right pr-7"
              />
              <span className="absolute right-2 top-1.5 text-slate-400 text-[11px]">°C</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">TA Systole</label>
            <div className="relative">
              <input
                type="number"
                value={vitals.systolicBP}
                onChange={(e) => setVitals({ ...vitals, systolicBP: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-right pr-9"
              />
              <span className="absolute right-1.5 top-1.5 text-slate-400 text-[10px]">mmHg</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">TA Diastole</label>
            <div className="relative">
              <input
                type="number"
                value={vitals.diastolicBP}
                onChange={(e) => setVitals({ ...vitals, diastolicBP: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-right pr-9"
              />
              <span className="absolute right-1.5 top-1.5 text-slate-400 text-[10px]">mmHg</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Fréq. Cardiaque</label>
            <div className="relative">
              <input
                type="number"
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-right pr-8"
              />
              <span className="absolute right-1.5 top-1.5 text-slate-400 text-[10px]">bpm</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Sat. O2</label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={vitals.oxygenSaturation}
                onChange={(e) => setVitals({ ...vitals, oxygenSaturation: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-right pr-6"
              />
              <span className="absolute right-2 top-1.5 text-slate-400 text-[11px]">%</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Poids</label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-right pr-6"
              />
              <span className="absolute right-2 top-1.5 text-slate-400 text-[11px]">kg</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Taille</label>
            <div className="relative">
              <input
                type="number"
                value={vitals.height}
                onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 text-right pr-6"
              />
              <span className="absolute right-2 top-1.5 text-slate-400 text-[11px]">cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Observation Clinique & Diagnostic */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            3. Examen Clinique & Diagnostic
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motif de consultation *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Symptômes & Anamnèse</label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Historique de la maladie, plaintes du patient..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Examen Physique</label>
              <textarea
                rows={3}
                value={physicalExamination}
                onChange={(e) => setPhysicalExamination(e.target.value)}
                placeholder="Auscultation cardio-pulmonaire, palpation abdominale, examen neurologique..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Diagnostic principal *</label>
              <textarea
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
                placeholder="Conclusion diagnostique..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Conduite à tenir / Traitement</label>
              <textarea
                rows={2}
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Plan de traitement, repos, examens complémentaires..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Module Ordonnance Intégré */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={createPrescription}
              onChange={(e) => setCreatePrescription(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="font-bold text-slate-800 text-sm uppercase tracking-wide">
              4. Créer et délivrer une ordonnance médicale pour cette consultation
            </span>
          </label>
        </div>

        {createPrescription && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="space-y-3">
              {rxItems.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700">Médicament #{index + 1}</span>
                    {rxItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRxItem(index)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 font-medium mb-1">
                        Sélectionner depuis la pharmacie ou saisir
                      </label>
                      <select
                        value={item.medicineId}
                        onChange={(e) => handleMedChange(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.genericName}) — {m.dosage} [{m.form}] (Stock: {m.currentStock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Quantité (boîtes)</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value || '1', 10);
                          setRxItems((prev) => {
                            const copy = [...prev];
                            copy[index].quantity = val;
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
                        value={item.frequency}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxItems((prev) => {
                            const copy = [...prev];
                            copy[index].frequency = val;
                            return copy;
                          });
                        }}
                        placeholder="ex: 1 cp matin et soir"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Durée du traitement</label>
                      <input
                        type="text"
                        value={item.duration}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxItems((prev) => {
                            const copy = [...prev];
                            copy[index].duration = val;
                            return copy;
                          });
                        }}
                        placeholder="ex: Pendant 7 jours"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Instructions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRxItems((prev) => {
                            const copy = [...prev];
                            copy[index].instructions = val;
                            return copy;
                          });
                        }}
                        placeholder="ex: Au milieu des repas"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRxItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un autre médicament</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/consultations"
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
              <span>Enregistrement en cours...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Enregistrer la consultation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
