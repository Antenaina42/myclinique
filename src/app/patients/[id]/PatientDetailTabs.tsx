'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Stethoscope,
  FileText,
  CreditCard,
  FolderOpen,
  PlusCircle,
  Download,
  ExternalLink,
  Clock,
  Printer,
  ShieldCheck,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { calculateAge, formatDate, formatCurrency, getStatusBadge } from '@/lib/formatters';

interface PatientDetailTabsProps {
  patient: any;
  userRole: string;
}

export default function PatientDetailTabs({ patient, userRole }: PatientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<
    'info' | 'medical' | 'consultations' | 'prescriptions' | 'documents' | 'invoices'
  >('info');

  const age = calculateAge(patient.birthDate);
  const allergies = patient.medicalRecord?.allergies;

  const tabs = [
    { id: 'info', label: 'Informations', count: null },
    { id: 'medical', label: 'Dossier Médical', count: null },
    { id: 'consultations', label: 'Consultations', count: patient.consultations.length },
    { id: 'prescriptions', label: 'Ordonnances', count: patient.prescriptions.length },
    { id: 'documents', label: 'Documents & Analyses', count: patient.documents.length },
    { id: 'invoices', label: 'Factures & Règlements', count: patient.invoices.length },
  ];

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Identité */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {patient.lastName} {patient.firstName}
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {patient.patientNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Groupe {patient.bloodGroup || 'O+'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Né(e) le {formatDate(patient.birthDate)} ({age} ans) • {patient.gender === 'FEMALE' ? 'Femme' : 'Homme'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {patient.phone}
                </span>
                {patient.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {patient.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <Link
              href={`/consultations/new?patientId=${patient.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              <span>+ Consultation</span>
            </Link>

            <Link
              href={`/prescriptions/new?patientId=${patient.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>+ Ordonnance</span>
            </Link>

            <Link
              href={`/invoices/new?patientId=${patient.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>+ Facturer</span>
            </Link>
          </div>
        </div>

        {/* Emergency & Allergies Banner */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Allergies Highlight */}
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            allergies && allergies.toLowerCase() !== 'aucune'
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 ${
              allergies && allergies.toLowerCase() !== 'aucune' ? 'text-amber-600' : 'text-slate-400'
            }`} />
            <div>
              <span className="font-bold">Allergies connues : </span>
              <span>{allergies || 'Aucune allergie signalée'}</span>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900 flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">Contact d'Urgence : </span>
              <span>
                {patient.emergencyContactName ? (
                  `${patient.emergencyContactName} (${patient.emergencyContactRel || 'Proche'}) — ${patient.emergencyContactPhone}`
                ) : (
                  'Non renseigné'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Informations Personnelles */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              État Civil & Coordonnées
            </h3>
            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <dt className="text-slate-400 font-medium">Nom complet</dt>
              <dd className="text-slate-800 font-semibold">{patient.lastName} {patient.firstName}</dd>

              <dt className="text-slate-400 font-medium">Date de naissance</dt>
              <dd className="text-slate-800">{formatDate(patient.birthDate)} ({age} ans)</dd>

              <dt className="text-slate-400 font-medium">Sexe biologique</dt>
              <dd className="text-slate-800">{patient.gender === 'FEMALE' ? 'Féminin' : 'Masculin'}</dd>

              <dt className="text-slate-400 font-medium">Groupe sanguin</dt>
              <dd className="text-rose-600 font-bold">{patient.bloodGroup || 'O+'}</dd>

              <dt className="text-slate-400 font-medium">Téléphone</dt>
              <dd className="text-slate-800 font-medium">{patient.phone}</dd>

              <dt className="text-slate-400 font-medium">Email</dt>
              <dd className="text-slate-800">{patient.email || '-'}</dd>

              <dt className="text-slate-400 font-medium">Adresse</dt>
              <dd className="text-slate-800">{patient.address || '-'}, {patient.city}</dd>
            </dl>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              Suivi Médical & Médecin Référent
            </h3>
            <div className="space-y-4 text-xs">
              {patient.primaryDoctor ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                    Dr
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      Dr. {patient.primaryDoctor.user.firstName} {patient.primaryDoctor.user.lastName}
                    </p>
                    <p className="text-slate-500">
                      Spécialité : {patient.primaryDoctor.specialty.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      N° Ordre : {patient.primaryDoctor.licenseNumber}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic">Aucun médecin traitant assigné.</p>
              )}

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <p className="font-bold text-emerald-800 text-xs mb-1">Dossier créé le :</p>
                <p className="text-emerald-700 text-xs">{formatDate(patient.createdAt)}</p>
                <p className="text-[11px] text-emerald-600 mt-1">
                  Établissement : {patient.clinic?.name || 'Établissement Médical'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dossier Médical */}
      {activeTab === 'medical' && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">
              Antécédents et Profil Clinique Patient
            </h3>
            <span className="text-[11px] text-slate-400">Dossier Médical Informatisé</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Allergies */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Allergies médicamenteuses & alimentaires
              </span>
              <p className="text-slate-800 font-medium">
                {patient.medicalRecord?.allergies || 'Aucune allergie connue.'}
              </p>
            </div>

            {/* Maladies chroniques */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-blue-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                Maladies Chroniques & ALD
              </span>
              <p className="text-slate-800 font-medium">
                {patient.medicalRecord?.chronicDiseases || 'Aucune affection de longue durée signalée.'}
              </p>
            </div>

            {/* Antécédents chirurgicaux */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-purple-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Antécédents Chirurgicaux & Hospitalisations
              </span>
              <p className="text-slate-800 font-medium">
                {patient.medicalRecord?.surgicalHistory || 'Aucun antécédent chirurgical répertorié.'}
              </p>
            </div>

            {/* Antécédents familiaux */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-slate-500">
                Antécédents Familiaux
              </span>
              <p className="text-slate-800 font-medium">
                {patient.medicalRecord?.familyHistory || 'Non renseigné.'}
              </p>
            </div>

            {/* Habitudes de vie */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-emerald-700">
                Habitudes de vie & Toxiques
              </span>
              <p className="text-slate-800 font-medium">
                {patient.medicalRecord?.habits || 'Aucun facteur toxique signalé.'}
              </p>
            </div>

            {/* Notes générales */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-slate-500">
                Observations Générales du Médecin
              </span>
              <p className="text-slate-800 font-medium">
                {patient.medicalRecord?.generalNotes || 'Dossier informatisé conforme.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Historique Consultations */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Historique des Consultations ({patient.consultations.length})
            </h3>
            <Link
              href={`/consultations/new?patientId=${patient.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nouvelle Consultation</span>
            </Link>
          </div>

          {patient.consultations.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Aucune consultation enregistrée pour ce patient.
            </div>
          ) : (
            patient.consultations.map((c: any) => (
              <div
                key={c.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{c.reason}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Terminée
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDate(c.consultationDate)} • Dr. {c.doctor.user.lastName} ({c.doctor.specialty.name})
                  </span>
                </div>

                {/* Vitals Summary */}
                {c.vitalSigns && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-wrap gap-4 text-xs">
                    {c.vitalSigns.temperature && (
                      <span>T° : <strong>{c.vitalSigns.temperature} °C</strong></span>
                    )}
                    {c.vitalSigns.systolicBP && c.vitalSigns.diastolicBP && (
                      <span>TA : <strong>{c.vitalSigns.systolicBP}/{c.vitalSigns.diastolicBP} mmHg</strong></span>
                    )}
                    {c.vitalSigns.heartRate && (
                      <span>Pouls : <strong>{c.vitalSigns.heartRate} bpm</strong></span>
                    )}
                    {c.vitalSigns.oxygenSaturation && (
                      <span>SpO2 : <strong>{c.vitalSigns.oxygenSaturation} %</strong></span>
                    )}
                    {c.vitalSigns.weight && (
                      <span>Poids : <strong>{c.vitalSigns.weight} kg</strong></span>
                    )}
                    {c.vitalSigns.bmi && (
                      <span>IMC : <strong>{c.vitalSigns.bmi}</strong></span>
                    )}
                  </div>
                )}

                {/* Diagnosis & Treatment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Diagnostic</span>
                    <p className="text-slate-800 font-semibold mt-0.5">{c.diagnosis || 'Non renseigné'}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Traitement prescrit</span>
                    <p className="text-slate-800 font-medium mt-0.5">{c.treatment || 'Aucun traitement'}</p>
                  </div>
                </div>

                {c.physicalExamination && (
                  <div className="text-xs pt-1">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Examen clinique</span>
                    <p className="text-slate-600 mt-0.5">{c.physicalExamination}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Ordonnances Médicales */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Ordonnances Médicales ({patient.prescriptions.length})
            </h3>
            <Link
              href={`/prescriptions/new?patientId=${patient.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Créer Ordonnance</span>
            </Link>
          </div>

          {patient.prescriptions.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Aucune ordonnance délivrée pour ce patient.
            </div>
          ) : (
            patient.prescriptions.map((rx: any) => (
              <div
                key={rx.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{rx.prescriptionNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Active
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Délivrée le {formatDate(rx.createdAt)} par Dr. {rx.doctor.user.lastName} ({rx.doctor.specialty.name})
                    </span>
                  </div>

                  {/* PDF Download Button */}
                  <a
                    href={`/api/prescriptions/${rx.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger Ordonnance PDF</span>
                  </a>
                </div>

                {/* Medicines List */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Médicaments prescrits ({rx.items.length}) :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {rx.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {item.medicineName} ({item.dosage})
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                            {item.form}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 font-medium">
                          {item.frequency} • {item.duration} (Qté : {item.quantity})
                        </p>
                        {item.instructions && (
                          <p className="text-[11px] text-slate-400 mt-0.5 italic">
                            Instructions : {item.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Documents & Analyses */}
      {activeTab === 'documents' && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">
              Documents Médicaux, Analyses & Radiographies ({patient.documents.length})
            </h3>
          </div>

          {patient.documents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucun document numérique attaché à ce dossier.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patient.documents.map((doc: any) => (
                <div key={doc.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-800">{doc.title}</p>
                      <span className="text-[10px] text-slate-400">{formatDate(doc.createdAt)} • {doc.category}</span>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    className="p-1 text-slate-400 hover:text-blue-600"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Factures & Règlements */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Factures et Règlements ({patient.invoices.length})
            </h3>
            <Link
              href={`/invoices/new?patientId=${patient.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Créer Facture</span>
            </Link>
          </div>

          {patient.invoices.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Aucune facture émise pour ce patient.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">N° Facture</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Prestations</th>
                    <th className="py-2.5 px-4">Total</th>
                    <th className="py-2.5 px-4">Réglé</th>
                    <th className="py-2.5 px-4">Solde dû</th>
                    <th className="py-2.5 px-4">Statut</th>
                    <th className="py-2.5 px-4 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patient.invoices.map((inv: any) => {
                    const badge = getStatusBadge(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(inv.issuedDate)}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {inv.items.map((i: any) => i.description).join(', ') || 'Consultation'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">
                          {formatCurrency(inv.paidAmount)}
                        </td>
                        <td className={`py-3 px-4 font-bold ${inv.balance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {formatCurrency(inv.balance)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
