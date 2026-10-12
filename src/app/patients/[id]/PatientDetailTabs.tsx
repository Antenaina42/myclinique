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
  TrendingUp,
  Building2,
  Skull,
  RotateCcw,
  Sparkles,
  Pill,
  FlaskConical,
  FileImage,
  Eye,
  Trash2,
  Edit2,
  ShieldAlert,
  ChevronRight,
  Info,
} from 'lucide-react';
import { calculateAge, formatDate, formatCurrency, getStatusBadge } from '@/lib/formatters';
import { calculateBMI } from '@/lib/bmi';
import { ClinicalMetadata, ClinicalStatus, HospitalizationItem } from '@/lib/clinicalMetadata';
import ClinicalStatusModal from '@/components/patient/ClinicalStatusModal';
import HospitalizationModal from '@/components/patient/HospitalizationModal';
import MedicalImageViewerModal from '@/components/patient/MedicalImageViewerModal';
import VitalsEvolutionModal from '@/components/patient/VitalsEvolutionModal';

interface PatientDetailTabsProps {
  patient: any;
  initialClinicalMetadata: ClinicalMetadata;
  userRole: string;
}

export type PatientTabId =
  | 'summary'
  | 'consultations'
  | 'appointments'
  | 'prescriptions'
  | 'analyses'
  | 'imaging'
  | 'hospitalizations'
  | 'treatments'
  | 'history'
  | 'timeline'
  | 'documents'
  | 'invoices';

export default function PatientDetailTabs({
  patient,
  initialClinicalMetadata,
  userRole,
}: PatientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<PatientTabId>('summary');

  // Clinical Status & Hospitalizations State
  const [clinicalStatus, setClinicalStatus] = useState<ClinicalStatus>(
    initialClinicalMetadata.clinicalStatus || 'EN_TRAITEMENT'
  );
  const [clinicalStatusDate, setClinicalStatusDate] = useState<string | null>(
    initialClinicalMetadata.clinicalStatusDate
  );
  const [deathDate, setDeathDate] = useState<string | null>(
    initialClinicalMetadata.deathDate
  );
  const [deathCause, setDeathCause] = useState<string | null>(
    initialClinicalMetadata.deathCause
  );
  const [treatmentResultNotes, setTreatmentResultNotes] = useState<string | null>(
    initialClinicalMetadata.treatmentResultNotes
  );
  const [hospitalizations, setHospitalizations] = useState<HospitalizationItem[]>(
    initialClinicalMetadata.hospitalizations || []
  );

  // Modals State
  const [isClinicalStatusModalOpen, setIsClinicalStatusModalOpen] = useState(false);
  const [isHospitalizationModalOpen, setIsHospitalizationModalOpen] = useState(false);
  const [hospitalizationToEdit, setHospitalizationToEdit] = useState<HospitalizationItem | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewerData, setViewerData] = useState<{
    title: string;
    imageUrl?: string | null;
    report?: string | null;
    conclusion?: string | null;
    date?: string | null;
  }>({ title: '' });
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  // Timeline Filter
  const [timelineFilter, setTimelineFilter] = useState<string>('ALL');

  const age = calculateAge(patient.birthDate);
  const allergies = patient.medicalRecord?.allergies;
  const chronicDiseases = patient.medicalRecord?.chronicDiseases;
  const surgicalHistory = patient.medicalRecord?.surgicalHistory;
  const familyHistory = patient.medicalRecord?.familyHistory;
  const habits = patient.medicalRecord?.habits;
  const generalNotes = initialClinicalMetadata.notes;

  // Latest clinical info
  const latestConsultation = patient.consultations?.[0];
  const latestVitals = latestConsultation?.vitalSigns;
  const bmiResult = calculateBMI(latestVitals?.weight, latestVitals?.height) ||
    (latestVitals?.bmi ? { bmi: latestVitals.bmi, label: 'Enregistré', colorClass: '', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800' } : null);

  const currentHospitalization = hospitalizations.find((h) => !h.dischargeDate);
  const latestHospitalization = hospitalizations[0];

  const upcomingAppointment = patient.appointments?.find(
    (a: any) =>
      new Date(a.appointmentDate) >= new Date() &&
      a.status !== 'CANCELLED' &&
      a.status !== 'NO_SHOW'
  );

  // Filtered documents
  const analysesDocs = (patient.documents || []).filter((d: any) => d.category === 'LAB_REPORT');
  const imagingDocs = (patient.documents || []).filter((d: any) => d.category === 'XRAY_IMAGING');

  // Unified Timeline Events
  const timelineEvents: Array<{
    id: string;
    type: 'CONSULTATION' | 'HOSPITALIZATION' | 'PRESCRIPTION' | 'ANALYSIS' | 'IMAGING' | 'DOCUMENT' | 'APPOINTMENT' | 'DEATH';
    title: string;
    subtitle: string;
    date: string;
    details?: string;
  }> = [];

  // 1. Consultations
  patient.consultations?.forEach((c: any) => {
    timelineEvents.push({
      id: `c_${c.id}`,
      type: 'CONSULTATION',
      title: `Consultation : ${c.reason}`,
      subtitle: `Dr. ${c.doctor?.user?.lastName || ''} (${c.doctor?.specialty?.name || 'Médecin'})`,
      date: c.consultationDate,
      details: c.diagnosis ? `Diagnostic : ${c.diagnosis}` : undefined,
    });
  });

  // 2. Hospitalizations
  hospitalizations.forEach((h: any) => {
    timelineEvents.push({
      id: `h_${h.id}`,
      type: 'HOSPITALIZATION',
      title: `Hospitalisation : ${h.hospitalName}`,
      subtitle: h.service ? `Service : ${h.service}` : 'Séjour hospitalier',
      date: h.admissionDate,
      details: `Motif : ${h.reason}${h.outcome ? ` • Issue : ${h.outcome}` : ''}`,
    });
  });

  // 3. Prescriptions
  patient.prescriptions?.forEach((p: any) => {
    timelineEvents.push({
      id: `p_${p.id}`,
      type: 'PRESCRIPTION',
      title: `Ordonnance ${p.prescriptionNumber}`,
      subtitle: `Dr. ${p.doctor?.user?.lastName || ''}`,
      date: p.createdAt,
      details: p.items?.map((i: any) => i.medicineName).join(', ') || 'Prescription médicamenteuse',
    });
  });

  // 4. Analyses
  analysesDocs.forEach((d: any) => {
    timelineEvents.push({
      id: `ana_${d.id}`,
      type: 'ANALYSIS',
      title: `Analyse : ${d.title}`,
      subtitle: d.uploadedBy ? `Labo / Par : ${d.uploadedBy}` : 'Bilan de biologie médicale',
      date: d.createdAt,
      details: d.notes || undefined,
    });
  });

  // 5. Imaging
  imagingDocs.forEach((d: any) => {
    timelineEvents.push({
      id: `img_${d.id}`,
      type: 'IMAGING',
      title: `Imagerie : ${d.title}`,
      subtitle: 'Examen radiologique / échographie',
      date: d.createdAt,
      details: d.notes || undefined,
    });
  });

  // 6. Appointments
  patient.appointments?.forEach((a: any) => {
    timelineEvents.push({
      id: `apt_${a.id}`,
      type: 'APPOINTMENT',
      title: `Rendez-vous : ${a.reason || 'Consultation'}`,
      subtitle: `À ${a.startTime} • Statut : ${a.status}`,
      date: a.appointmentDate,
      details: a.notes || undefined,
    });
  });

  // 7. Death
  if (clinicalStatus === 'DECEDE') {
    timelineEvents.push({
      id: 'death_event',
      type: 'DEATH',
      title: 'Décès du patient',
      subtitle: deathCause ? `Cause : ${deathCause}` : 'Clôture du dossier médical',
      date: deathDate || clinicalStatusDate || new Date().toISOString(),
      details: 'Patient déclaré décédé.',
    });
  }

  // Sort timeline descending
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Clinical Status Badge Helper
  const getClinicalBadge = (status: ClinicalStatus) => {
    switch (status) {
      case 'SOIGNE':
        return {
          label: 'Soigné / Guéri',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
          dot: 'bg-emerald-500',
          icon: Sparkles,
        };
      case 'STABLE':
        return {
          label: 'Affection stabilisée',
          bg: 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100',
          dot: 'bg-purple-500',
          icon: Activity,
        };
      case 'RECHUTE':
        return {
          label: 'Rechute clinique',
          bg: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
          dot: 'bg-amber-500',
          icon: RotateCcw,
        };
      case 'COMPLICATION':
        return {
          label: 'Complication',
          bg: 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100',
          dot: 'bg-orange-500',
          icon: AlertTriangle,
        };
      case 'DECEDE':
        return {
          label: 'Décédé(e)',
          bg: 'bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800',
          dot: 'bg-rose-500',
          icon: Skull,
        };
      case 'EN_TRAITEMENT':
      default:
        return {
          label: 'En traitement',
          bg: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
          dot: 'bg-blue-500',
          icon: Pill,
        };
    }
  };

  const currentBadge = getClinicalBadge(clinicalStatus);

  // Tabs definition
  const tabs = [
    { id: 'summary', label: 'Résumé Clinique', icon: User, count: null },
    { id: 'consultations', label: 'Consultations', icon: Stethoscope, count: patient.consultations?.length || 0 },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar, count: patient.appointments?.length || 0 },
    { id: 'prescriptions', label: 'Ordonnances', icon: FileText, count: patient.prescriptions?.length || 0 },
    { id: 'analyses', label: 'Analyses & Labo', icon: FlaskConical, count: analysesDocs.length },
    { id: 'imaging', label: 'Imagerie', icon: FileImage, count: imagingDocs.length },
    { id: 'hospitalizations', label: 'Hospitalisations', icon: Building2, count: hospitalizations.length },
    { id: 'treatments', label: 'Traitements', icon: Pill, count: null },
    { id: 'history', label: 'Antécédents', icon: ShieldCheck, count: null },
    { id: 'timeline', label: 'Chronologie', icon: Clock, count: timelineEvents.length },
    { id: 'documents', label: 'Documents', icon: FolderOpen, count: patient.documents?.length || 0 },
    { id: 'invoices', label: 'Factures & Règlements', icon: CreditCard, count: patient.invoices?.length || 0 },
  ];

  const handleDeleteHospitalization = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cet enregistrement d'hospitalisation ?")) return;
    const filtered = hospitalizations.filter((h) => h.id !== id);
    try {
      const res = await fetch(`/api/patients/${patient.id}/clinical-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalizations: filtered }),
      });
      if (res.ok) {
        setHospitalizations(filtered);
      } else {
        alert("Erreur lors de la suppression de l'hospitalisation");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion");
    }
  };

  const handleOpenImageViewer = (doc: any) => {
    setViewerData({
      title: doc.title,
      imageUrl: doc.fileUrl,
      report: doc.notes,
      conclusion: doc.category === 'XRAY_IMAGING' ? 'Examen radiographique conforme' : undefined,
      date: formatDate(doc.createdAt),
    });
    setIsImageViewerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Identité */}
          <div className="flex items-start sm:items-center gap-4.5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-700 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {patient.lastName.toUpperCase()} {patient.firstName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {patient.patientNumber}
                </span>

                {/* DoctorDesk Interactive Clinical Status Badge */}
                <button
                  type="button"
                  onClick={() => setIsClinicalStatusModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 shadow-2xs ${currentBadge.bg}`}
                  title="Cliquer pour modifier le statut clinique ou l'issue thérapeutique"
                >
                  <span className={`w-2 h-2 rounded-full ${currentBadge.dot} animate-pulse`} />
                  <currentBadge.icon className="w-3.5 h-3.5" />
                  <span>{currentBadge.label}</span>
                  <Edit2 className="w-3 h-3 opacity-60 ml-0.5" />
                </button>

                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Groupe {patient.bloodGroup || 'O+'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Né(e) le {formatDate(patient.birthDate)} ({age} ans) • {patient.gender === 'FEMALE' ? 'Femme' : 'Homme'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {patient.phone}
                </span>
                {patient.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {patient.city}
                    </span>
                  </>
                )}
                {patient.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {patient.email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons matching DoctorDesk */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setIsClinicalStatusModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Statut Clinique</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setHospitalizationToEdit(null);
                setIsHospitalizationModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Building2 className="w-4 h-4 text-rose-600" />
              <span>Hospitaliser</span>
            </button>

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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>+ Facturer</span>
            </Link>
          </div>
        </div>

        {/* SECTION: ALERTE PATIENT DECEDE (DOCTORDESK BANNER) */}
        {clinicalStatus === 'DECEDE' && (
          <div className="mt-5 p-4 bg-slate-900 text-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-slate-800 animate-fadeIn">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 shrink-0">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Dossier de Patient Décédé</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                    Dossier Clôturé
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {deathDate ? `Date de décès : ${formatDate(deathDate)}` : 'Date de décès non spécifiée'}
                  {deathCause ? ` • Cause : ${deathCause}` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsClinicalStatusModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              Modifier informations de décès
            </button>
          </div>
        )}

        {/* SECTION: ALERTE MÉDICALE ET CONTACT D'URGENCE */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Allergies Highlight */}
          <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 ${
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

          {/* Contact d'urgence */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-blue-900 flex items-center gap-2.5">
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

      {/* DoctorDesk 12 Navigation Tabs Bar */}
      <div className="flex border-b border-slate-200/90 gap-1 overflow-x-auto select-none no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PatientTabId)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap -mb-px ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
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

      {/* Tab Panes */}
      <div className="animate-fadeIn">
        {/* ========================================================= */}
        {/* TAB 1: RÉSUMÉ DU DOSSIER & VUE CLINIQUE 360°               */}
        {/* ========================================================= */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* VUE CLINIQUE EN UN CLIN D'ŒIL (DOCTORDESK 4-CARDS) */}
            <div className="bg-gradient-to-br from-blue-50/70 via-white to-slate-50 p-5 rounded-3xl border border-blue-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-blue-950">
                      Vue Clinique d'un Clin d'Œil
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Synthèse instantanée de l'état médical et du parcours de soins
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsClinicalStatusModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-2xs"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ajuster statut</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* 1. Statut & Traitement */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between hover:border-blue-300 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Statut & Évolution
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${currentBadge.dot}`} />
                      <strong className="text-xs font-bold text-slate-900">{currentBadge.label}</strong>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {treatmentResultNotes || "Aucune note sur l'issue du traitement."}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsClinicalStatusModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 text-left mt-2 flex items-center gap-1"
                  >
                    <span>Mettre à jour</span>
                    <span>→</span>
                  </button>
                </div>

                {/* 2. Dernière consultation */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between hover:border-blue-300 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Dernière Consultation
                    </span>
                    {latestConsultation ? (
                      <div className="mt-1">
                        <div className="font-bold text-xs text-slate-900">
                          {formatDate(latestConsultation.consultationDate)}
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                          Motif : {latestConsultation.reason}
                        </p>
                        {latestConsultation.diagnosis && (
                          <p className="text-[11px] text-blue-700 font-semibold truncate mt-0.5">
                            Diag : {latestConsultation.diagnosis}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">Aucune consultation enregistrée.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('consultations')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 text-left mt-2 flex items-center gap-1"
                  >
                    <span>Voir consultations ({patient.consultations?.length || 0})</span>
                    <span>→</span>
                  </button>
                </div>

                {/* 3. Séjour Hospitalier */}
                <div className={`p-4 rounded-2xl border shadow-2xs space-y-1.5 flex flex-col justify-between transition-colors ${
                  currentHospitalization
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : 'bg-white border-slate-200/80 hover:border-blue-300'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Séjour Hospitalier
                    </span>
                    {currentHospitalization ? (
                      <div className="mt-1">
                        <div className="flex items-center gap-1 text-xs font-black text-rose-700">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                          Hospitalisé(e) actuellement
                        </div>
                        <p className="text-[11px] font-bold text-rose-900 truncate mt-0.5">
                          {currentHospitalization.hospitalName} {currentHospitalization.service ? `(${currentHospitalization.service})` : ''}
                        </p>
                        <p className="text-[10px] text-rose-700 mt-0.5">
                          Depuis le {formatDate(currentHospitalization.admissionDate)}
                        </p>
                      </div>
                    ) : latestHospitalization ? (
                      <div className="mt-1">
                        <div className="font-bold text-xs text-slate-800">
                          {latestHospitalization.hospitalName}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Du {formatDate(latestHospitalization.admissionDate)} au {latestHospitalization.dischargeDate ? formatDate(latestHospitalization.dischargeDate) : '—'}
                        </p>
                        {latestHospitalization.outcome && (
                          <p className="text-[10px] text-emerald-700 font-semibold truncate mt-0.5">
                            Issue : {latestHospitalization.outcome}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">Aucun séjour hospitalier.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('hospitalizations')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 text-left mt-2 flex items-center gap-1"
                  >
                    <span>Gérer séjours ({hospitalizations.length})</span>
                    <span>→</span>
                  </button>
                </div>

                {/* 4. Prochain Rendez-vous / Suivi */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5 flex flex-col justify-between hover:border-blue-300 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Prochaine Échéance
                    </span>
                    {upcomingAppointment ? (
                      <div className="mt-1">
                        <div className="font-bold text-xs text-slate-900">
                          RDV le {formatDate(upcomingAppointment.appointmentDate)}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          À {upcomingAppointment.startTime} • {upcomingAppointment.reason || 'Consultation'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">Aucun rendez-vous futur planifié.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 text-left mt-2 flex items-center gap-1"
                  >
                    <span>Gérer les RDV</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split layout: Constantes & État Civil vs. Antécédents & Historique */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne gauche : Dernières constantes vitales avec JAUGE IMC HAS */}
              <div className="space-y-6">
                {/* Dernières constantes vitales */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      <span>Dernières Constantes</span>
                    </h3>
                    <button
                      onClick={() => setIsVitalsModalOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Évolution</span>
                    </button>
                  </div>

                  {latestVitals ? (
                    <div className="space-y-3 text-xs">
                      <div className="text-[11px] text-slate-400 font-medium">
                        Relevées le {formatDate(latestConsultation.consultationDate)}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">Tension Artérielle</span>
                          <strong className="text-slate-800 text-sm font-bold">
                            {latestVitals.systolicBP && latestVitals.diastolicBP ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP} mmHg` : '—'}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">Fréquence Cardiaque</span>
                          <strong className="text-slate-800 text-sm font-bold">
                            {latestVitals.heartRate ? `${latestVitals.heartRate} bpm` : '—'}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">Température</span>
                          <strong className="text-slate-800 text-sm font-bold">
                            {latestVitals.temperature ? `${latestVitals.temperature} °C` : '—'}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">Saturation SpO2</span>
                          <strong className="text-slate-800 text-sm font-bold">
                            {latestVitals.oxygenSaturation ? `${latestVitals.oxygenSaturation} %` : '—'}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">Poids</span>
                          <strong className="text-slate-800 text-sm font-bold">
                            {latestVitals.weight ? `${latestVitals.weight} kg` : '—'}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">Taille</span>
                          <strong className="text-slate-800 text-sm font-bold">
                            {latestVitals.height ? `${latestVitals.height} cm` : '—'}
                          </strong>
                        </div>
                      </div>

                      {/* JAUGE IMC HAS */}
                      {bmiResult && (
                        <div className={`p-3 rounded-xl border ${bmiResult.colorClass} space-y-1`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              Indice Masse Corporelle (IMC)
                            </span>
                            <span className="font-mono font-black text-sm">{bmiResult.bmi} kg/m²</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="font-bold text-xs">{bmiResult.label}</span>
                            <span className="text-[10px] opacity-75 font-semibold">Référentiel HAS</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">Aucune constante vitale enregistrée pour le moment.</p>
                  )}
                </div>

                {/* État Civil & Coordonnées */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-slate-500 text-xs border-b border-slate-100 pb-2">
                    Coordonnées & Référent
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Adresse postale :</span>
                      <span className="font-semibold text-slate-800">{patient.address || 'Non renseignée'}, {patient.city}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Téléphone :</span>
                      <span className="font-mono font-bold text-slate-800">{patient.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email :</span>
                      <span className="font-medium text-slate-800">{patient.email || 'Non renseigné'}</span>
                    </div>
                    {patient.primaryDoctor && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-400 block text-[11px]">Médecin traitant assigné :</span>
                        <span className="font-bold text-blue-700">
                          Dr. {patient.primaryDoctor.user.firstName} {patient.primaryDoctor.user.lastName} ({patient.primaryDoctor.specialty.name})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne droite : Antécédents, Traitements, Dernières Consultations & Hospitalisations */}
              <div className="lg:col-span-2 space-y-6">
                {/* Antécédents & Traitements habituels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>Affections & Antécédents</span>
                    </h3>
                    <div className="space-y-2 text-slate-700 pt-1">
                      {chronicDiseases && (
                        <p><strong className="text-slate-900">Maladies chroniques :</strong> {chronicDiseases}</p>
                      )}
                      <p><strong className="text-slate-900">Médicaux :</strong> {patient.medicalRecord?.familyHistory || 'Néant'}</p>
                      <p><strong className="text-slate-900">Chirurgicaux :</strong> {surgicalHistory || 'Néant'}</p>
                      <p><strong className="text-slate-900">Habitudes de vie :</strong> {habits || 'Aucun facteur toxique'}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2 text-xs">
                    <h3 className="font-bold uppercase tracking-wider text-slate-500 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-emerald-600" />
                      <span>Traitements en cours</span>
                    </h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                      {generalNotes || 'Aucun traitement régulier répertorié pour ce patient.'}
                    </p>
                  </div>
                </div>

                {/* Dernières consultations */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold uppercase tracking-wider text-slate-600 text-xs flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span>Dernières consultations médicales</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('consultations')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                    >
                      Voir toutes ({patient.consultations?.length || 0})
                    </button>
                  </div>

                  {patient.consultations?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Aucune consultation enregistrée.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {patient.consultations?.slice(0, 3).map((c: any) => (
                        <div key={c.id} className="py-3 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{formatDate(c.consultationDate)}</span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              Dr. {c.doctor?.user?.lastName} ({c.doctor?.specialty?.name})
                            </span>
                          </div>
                          <div className="text-slate-700 font-semibold">{c.reason}</div>
                          {c.diagnosis && (
                            <div className="text-slate-500">
                              <strong className="text-blue-700">Diagnostic :</strong> {c.diagnosis}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Séjours Hospitaliers récents */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold uppercase tracking-wider text-slate-600 text-xs flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-rose-600" />
                      <span>Séjours & Hospitalisations ({hospitalizations.length})</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setHospitalizationToEdit(null);
                          setIsHospitalizationModalOpen(true);
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800"
                      >
                        + Ajouter
                      </button>
                      <button
                        onClick={() => setActiveTab('hospitalizations')}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Voir tous
                      </button>
                    </div>
                  </div>

                  {hospitalizations.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Aucun séjour hospitalier répertorié.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {hospitalizations.slice(0, 3).map((h) => (
                        <div key={h.id} className="py-2.5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              {h.hospitalName} {h.service ? `(${h.service})` : ''}
                            </span>
                            {!h.dischargeDate ? (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                                En cours
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                Sortie le {formatDate(h.dischargeDate)}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600 font-medium">Motif : {h.reason}</div>
                          {h.outcome && (
                            <div className="text-emerald-700 font-medium text-[11px]">
                              Issue : {h.outcome}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CONSULTATIONS                                      */}
        {/* ========================================================= */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Historique des Consultations ({patient.consultations.length})
              </h3>
              <Link
                href={`/consultations/new?patientId=${patient.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nouvelle Consultation</span>
              </Link>
            </div>

            {patient.consultations.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Aucune consultation enregistrée pour ce patient.
              </div>
            ) : (
              patient.consultations.map((c: any) => (
                <div
                  key={c.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{c.reason}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Terminée
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {formatDate(c.consultationDate)} • Dr. {c.doctor?.user?.lastName} ({c.doctor?.specialty?.name})
                    </span>
                  </div>

                  {/* Vitals Summary */}
                  {c.vitalSigns && (
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap gap-4 text-xs">
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
                      <span className="font-bold text-slate-500 uppercase text-[10px] block">Diagnostic retenu</span>
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

                  {c.prescription && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-purple-700 font-bold flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Ordonnance liée : {c.prescription.prescriptionNumber}
                      </span>
                      <a
                        href={`/api/prescriptions/${c.prescription.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger ordonnance PDF</span>
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RENDEZ-VOUS                                        */}
        {/* ========================================================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Rendez-vous du patient ({patient.appointments?.length || 0})
              </h3>
              <Link
                href={`/appointments/new?patientId=${patient.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nouveau RDV</span>
              </Link>
            </div>

            {patient.appointments?.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Aucun rendez-vous enregistré pour ce patient.
              </div>
            ) : (
              <div className="space-y-3">
                {patient.appointments?.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center w-16 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <div className="font-bold text-xs text-slate-900">{apt.startTime}</div>
                        <div className="text-[10px] text-slate-400">{apt.endTime || '30 min'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {formatDate(apt.appointmentDate)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {apt.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">{apt.reason || 'Consultation médicale'}</div>
                      </div>
                    </div>

                    <Link
                      href={`/consultations/new?patientId=${patient.id}&appointmentId=${apt.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Démarrer consultation</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ORDONNANCES                                        */}
        {/* ========================================================= */}
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
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Aucune ordonnance délivrée pour ce patient.
              </div>
            ) : (
              patient.prescriptions.map((rx: any) => (
                <div
                  key={rx.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4"
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
                        Délivrée le {formatDate(rx.createdAt)} par Dr. {rx.doctor?.user?.lastName} ({rx.doctor?.specialty?.name})
                      </span>
                    </div>

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
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
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

        {/* ========================================================= */}
        {/* TAB 5: ANALYSES & LABO                                    */}
        {/* ========================================================= */}
        {activeTab === 'analyses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Analyses Médicales & Bilans de Laboratoire ({analysesDocs.length})
              </h3>
            </div>

            {analysesDocs.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Aucun compte-rendu d'analyse biologique classé pour ce patient.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysesDocs.map((doc: any) => (
                  <div key={doc.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-sm text-slate-900">{doc.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(doc.createdAt)}</span>
                    </div>
                    {doc.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {doc.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        {doc.uploadedBy ? `Labo : ${doc.uploadedBy}` : 'Biologie médicale'}
                      </span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger rapport</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: IMAGERIE MÉDICALE                                  */}
        {/* ========================================================= */}
        {activeTab === 'imaging' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Imagerie Médicale & Radiographies ({imagingDocs.length})
              </h3>
            </div>

            {imagingDocs.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Aucun examen d'imagerie médicale rattaché à ce dossier.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imagingDocs.map((doc: any) => (
                  <div key={doc.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-sm text-slate-900">{doc.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(doc.createdAt)}</span>
                    </div>

                    {doc.notes && (
                      <div className="p-2.5 bg-purple-50/60 border border-purple-200 rounded-xl text-xs text-purple-950">
                        <strong className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-0.5">
                          Compte-rendu :
                        </strong>
                        {doc.notes}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger fichier</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenImageViewer(doc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ouvrir dans le visualiseur</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: HOSPITALISATIONS                                   */}
        {/* ========================================================= */}
        {activeTab === 'hospitalizations' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-600" />
                  <span>Séjours Hospitaliers & Suivi Clinique ({hospitalizations.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Admissions en clinique ou à l'hôpital, services, durées et comptes rendus
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setHospitalizationToEdit(null);
                  setIsHospitalizationModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-500/20 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nouvelle hospitalisation</span>
              </button>
            </div>

            {hospitalizations.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <Building2 className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">Aucun séjour hospitalier enregistré</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Enregistrez ici les admissions et les séjours cliniques de votre patient.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHospitalizationToEdit(null);
                    setIsHospitalizationModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Enregistrer une admission</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {hospitalizations.map((h) => {
                  const isOngoing = !h.dischargeDate;
                  return (
                    <div
                      key={h.id}
                      className={`p-5 rounded-2xl border shadow-xs space-y-4 ${
                        isOngoing ? 'bg-rose-50/20 border-rose-300' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isOngoing ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{h.hospitalName}</h4>
                              {h.service && (
                                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {h.service}
                                </span>
                              )}
                              {isOngoing ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                  En cours d'hospitalisation
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                  Séjour clôturé
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                              <span>Admission : <strong>{formatDate(h.admissionDate)}</strong></span>
                              {h.dischargeDate ? (
                                <span>• Sortie : <strong>{formatDate(h.dischargeDate)}</strong></span>
                              ) : (
                                <span className="text-rose-600 font-semibold">• Actuellement hospitalisé(e)</span>
                              )}
                              {h.doctorInCharge && (
                                <span>• Praticien : <strong>{h.doctorInCharge}</strong></span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setHospitalizationToEdit(h);
                              setIsHospitalizationModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Modifier</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHospitalization(h.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Motif d'admission
                          </span>
                          <p className="text-slate-800 font-medium">{h.reason}</p>
                        </div>

                        {h.outcome && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Issue / Évolution
                            </span>
                            <p className="text-slate-800 font-semibold">{h.outcome}</p>
                          </div>
                        )}
                      </div>

                      {h.summary && (
                        <div className="text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Compte rendu / Résumé d'hospitalisation
                          </span>
                          <p className="text-slate-700 whitespace-pre-line leading-relaxed">{h.summary}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: TRAITEMENTS                                        */}
        {/* ========================================================= */}
        {activeTab === 'treatments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-600" />
                <span>Traitements réguliers & Habituels</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {generalNotes || 'Aucun traitement régulier au long cours répertorié.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Allergies et Vigilance Médicamenteuse</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                {allergies || 'Aucune contre-indication ou allergie médicamenteuse particulière.'}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: ANTÉCÉDENTS                                        */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Antécédents Médicaux & Personnels
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {chronicDiseases || 'Aucun antécédent médical majeur renseigné.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Antécédents Chirurgicaux & Opérations
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {surgicalHistory || 'Aucun antécédent chirurgical répertorié.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Antécédents Familiaux
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {familyHistory || 'Aucun antécédent familial particulier renseigné.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Habitudes de vie & Facteurs de Risque
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {habits || 'Aucun facteur toxique (tabac, alcool) signalé.'}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 10: CHRONOLOGIE UNIFIÉE (TIMELINE DOCTORDESK)         */}
        {/* ========================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chronologie Médicale Unifiée ({timelineEvents.length} événements)
              </span>

              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { key: 'ALL', label: 'Tous' },
                  { key: 'CONSULTATION', label: 'Consultations' },
                  { key: 'HOSPITALIZATION', label: 'Hospitalisations' },
                  { key: 'PRESCRIPTION', label: 'Ordonnances' },
                  { key: 'ANALYSIS', label: 'Analyses' },
                  { key: 'IMAGING', label: 'Imagerie' },
                  { key: 'APPOINTMENT', label: 'Rendez-vous' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTimelineFilter(item.key)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      timelineFilter === item.key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {timelineEvents.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Aucun événement dans l'historique de ce patient.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                {timelineEvents
                  .filter((ev) => timelineFilter === 'ALL' || ev.type === timelineFilter)
                  .map((ev) => (
                    <div key={ev.id} className="relative group">
                      {/* Node Bullet Icon */}
                      <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-blue-600 shadow-xs">
                        {ev.type === 'CONSULTATION' && <Stethoscope className="w-3 h-3 text-blue-600" />}
                        {ev.type === 'HOSPITALIZATION' && <Building2 className="w-3 h-3 text-rose-600" />}
                        {ev.type === 'PRESCRIPTION' && <FileText className="w-3 h-3 text-purple-600" />}
                        {ev.type === 'ANALYSIS' && <FlaskConical className="w-3 h-3 text-emerald-600" />}
                        {ev.type === 'IMAGING' && <FileImage className="w-3 h-3 text-indigo-600" />}
                        {ev.type === 'APPOINTMENT' && <Calendar className="w-3 h-3 text-amber-600" />}
                        {ev.type === 'DEATH' && <Skull className="w-3 h-3 text-slate-900" />}
                      </div>

                      {/* Content Box */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[11px] text-blue-700 uppercase tracking-wide">
                            {ev.type}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {formatDate(ev.date)}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{ev.subtitle}</p>
                        {ev.details && (
                          <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                            {ev.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 11: DOCUMENTS JOINTS                                  */}
        {/* ========================================================= */}
        {activeTab === 'documents' && (
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">
                Bibliothèque de Documents du Patient ({patient.documents?.length || 0})
              </h3>
            </div>

            {patient.documents?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Aucun document numérique attaché à ce dossier.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patient.documents?.map((doc: any) => (
                  <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
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
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 12: FACTURES & RÈGLEMENTS                             */}
        {/* ========================================================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Factures et Règlements ({patient.invoices.length})
              </h3>
              <Link
                href={`/invoices/new?patientId=${patient.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Créer Facture</span>
              </Link>
            </div>

            {patient.invoices.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Aucune facture émise pour ce patient.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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

      {/* MODALS */}
      <ClinicalStatusModal
        isOpen={isClinicalStatusModalOpen}
        onClose={() => setIsClinicalStatusModalOpen(false)}
        patient={{
          id: patient.id,
          patientNumber: patient.patientNumber,
          firstName: patient.firstName,
          lastName: patient.lastName,
        }}
        currentStatus={clinicalStatus}
        currentStatusDate={clinicalStatusDate}
        currentDeathDate={deathDate}
        currentDeathCause={deathCause}
        currentTreatmentNotes={treatmentResultNotes}
        onSuccess={(updated) => {
          setClinicalStatus(updated.clinicalStatus);
          setClinicalStatusDate(updated.clinicalStatusDate);
          setDeathDate(updated.deathDate);
          setDeathCause(updated.deathCause);
          setTreatmentResultNotes(updated.treatmentResultNotes);
        }}
      />

      <HospitalizationModal
        isOpen={isHospitalizationModalOpen}
        onClose={() => {
          setIsHospitalizationModalOpen(false);
          setHospitalizationToEdit(null);
        }}
        patientId={patient.id}
        patientName={`${patient.lastName.toUpperCase()} ${patient.firstName}`}
        hospitalizations={hospitalizations}
        hospitalizationToEdit={hospitalizationToEdit}
        onSuccess={(updatedList) => {
          setHospitalizations(updatedList);
        }}
      />

      <MedicalImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        title={viewerData.title}
        imageUrl={viewerData.imageUrl}
        report={viewerData.report}
        conclusion={viewerData.conclusion}
        date={viewerData.date}
      />

      <VitalsEvolutionModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        patientName={`${patient.lastName.toUpperCase()} ${patient.firstName}`}
        consultations={patient.consultations || []}
      />
    </div>
  );
}
