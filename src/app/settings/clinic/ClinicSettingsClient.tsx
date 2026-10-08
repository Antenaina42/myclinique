'use client';

import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Server,
  Database,
  Activity,
  ShieldAlert,
} from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  slug: string;
  slogan?: string | null;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  taxId?: string | null;
  currency: string;
  dateFormat: string;
  timeZone: string;
  settings?: Array<{ key: string; value: string }>;
}

interface ClinicSettingsClientProps {
  initialClinic: Clinic;
  systemMetrics: {
    patientCount: number;
    consultationCount: number;
    invoiceCount: number;
    medicineCount: number;
    userCount: number;
  };
  userRole: string;
}

export default function ClinicSettingsClient({
  initialClinic,
  systemMetrics,
  userRole,
}: ClinicSettingsClientProps) {
  const [clinic, setClinic] = useState<Clinic>(initialClinic);
  const [activeTab, setActiveTab] = useState<'general' | 'finance' | 'medical' | 'system'>('general');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'CLINIC_ADMIN';

  // Custom setting helper
  const getSetting = (key: string, fallback: string = '') => {
    return clinic.settings?.find((s) => s.key === key)?.value || fallback;
  };

  const [formData, setFormData] = useState({
    name: clinic.name,
    slogan: clinic.slogan || '',
    address: clinic.address || '',
    phone: clinic.phone || '',
    email: clinic.email || '',
    website: clinic.website || '',
    taxId: clinic.taxId || '',
    currency: clinic.currency || 'Ar',
    dateFormat: clinic.dateFormat || 'DD/MM/YYYY',
    timeZone: clinic.timeZone || 'Indian/Antananarivo',
    consultationDuration: getSetting('consultation_duration', '30'),
    openingHours: getSetting('opening_hours', 'Lundi - Vendredi: 07h30 - 18h00 | Samedi: 08h00 - 12h00'),
    emergencyPhone: getSetting('emergency_phone', '+261 34 00 000 01'),
    prescriptionFooter: getSetting('prescription_footer', 'Ordonnance médicale strictement personnelle. Ne pas dépasser la posologie prescrite.'),
    invoiceFooter: getSetting('invoice_footer', 'Règlement à réception. Tout retard entraîne des pénalités légales.'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg('Seuls les administrateurs peuvent modifier les paramètres.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slogan: formData.slogan,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          taxId: formData.taxId,
          currency: formData.currency,
          dateFormat: formData.dateFormat,
          timeZone: formData.timeZone,
          customSettings: {
            consultation_duration: formData.consultationDuration,
            opening_hours: formData.openingHours,
            emergency_phone: formData.emergencyPhone,
            prescription_footer: formData.prescriptionFooter,
            invoice_footer: formData.invoiceFooter,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour des paramètres');

      setClinic(data.clinic);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('clinic-updated', { detail: { name: data.clinic.name } })
        );
      }
      setSuccessMsg('Paramètres de la clinique enregistrés avec succès !');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Établissement & Coordonnées</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'finance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Devise & Facturation</span>
        </button>

        <button
          onClick={() => setActiveTab('medical')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'medical'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Consultations & Soins</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Diagnostic Système & MySQL</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Mode lecture seule : seuls les utilisateurs avec le rôle <strong>Super Admin</strong> ou <strong>Clinic Admin</strong> peuvent enregistrer des modifications.
          </span>
        </div>
      )}

      {/* Tab Content Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: General Info */}
        {activeTab === 'general' && (
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Identité de l'Établissement</h2>
              <p className="text-xs text-slate-500">
                Ces informations apparaîtront sur les en-têtes d'ordonnances, factures et documents officiels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nom officiel de la Clinique *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                  placeholder="Clinique Médicale M-It"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Slogan ou sous-titre
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                  placeholder="La gestion intelligente de votre clinique"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Numéro d'Identification Fiscale (NIF / STAT)
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                  placeholder="NIF: 3000123456 / STAT: 85111"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Adresse physique complète
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    placeholder="Lot IVG 35 Antananarivo, Madagascar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Téléphone standard
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    placeholder="+261 20 22 123 45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ligne Urgences 24/7
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    placeholder="+261 34 00 000 01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email de contact / Secrétariat
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled={!isAdmin}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    placeholder="contact@myclinique.mg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Site Web officiel
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    disabled={!isAdmin}
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                    placeholder="https://myclinique.mg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Finance & Invoicing */}
        {activeTab === 'finance' && (
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Devise Monétaire & Facturation</h2>
              <p className="text-xs text-slate-500">
                Configuration des montants, devise par défaut et mentions légales des factures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Devise Principale *
                </label>
                <select
                  disabled={!isAdmin}
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                >
                  <option value="Ar">Ar — Ariary malgache (Par défaut)</option>
                  <option value="EUR">€ — Euro (EUR)</option>
                  <option value="USD">$ — Dollar américain (USD)</option>
                  <option value="FCFA">FCFA — Franc CFA</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tous les montants des factures, pharmacie et paiements utiliseront ce symbole.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fuseau Horaire
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.timeZone}
                  onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                  placeholder="Indian/Antananarivo"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mention de bas de page sur les factures et reçus
                </label>
                <textarea
                  rows={3}
                  disabled={!isAdmin}
                  value={formData.invoiceFooter}
                  onChange={(e) => setFormData({ ...formData, invoiceFooter: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                  placeholder="Mention légale ou instructions de paiement..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Medical & Consultations */}
        {activeTab === 'medical' && (
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Consultations & Ordonnances</h2>
              <p className="text-xs text-slate-500">
                Configuration des créneaux médicaux et mentions sur les ordonnances imprimables.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Durée standard d'une consultation (minutes)
                </label>
                <select
                  disabled={!isAdmin}
                  value={formData.consultationDuration}
                  onChange={(e) => setFormData({ ...formData, consultationDuration: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                >
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes (Recommandé)</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Horaires d'ouverture de la clinique
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                  placeholder="Lundi - Vendredi: 07h30 - 18h00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mention légale sur les ordonnances médicales (PDF)
                </label>
                <textarea
                  rows={3}
                  disabled={!isAdmin}
                  value={formData.prescriptionFooter}
                  onChange={(e) => setFormData({ ...formData, prescriptionFooter: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50"
                  placeholder="Ordonnance médicale strictement personnelle..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: System Diagnostic & MySQL */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">Diagnostic & Infrastructure Système</h2>
                <p className="text-xs text-slate-500">
                  État des composants logiciels, moteur de données relationnel et volumes en production.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-700">Moteur Base de Données</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">MySQL 9.1 (WampServer)</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Connecté sur le port 3306
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Server className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-700">Serveur Applicatif</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">Next.js 14 App Router</div>
                    <div className="text-[11px] text-slate-500 mt-1">Node.js 24 / React 18</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-700">ORM & Schéma</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">Prisma ORM 5.22</div>
                    <div className="text-[11px] text-slate-500 mt-1">30 modèles relationnels</div>
                  </div>
                </div>
              </div>

              {/* Volume Metrics */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Volumes de Données Enregistrés
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <div className="text-lg font-extrabold text-blue-700">{systemMetrics.patientCount}</div>
                    <div className="text-[11px] text-slate-600 font-medium">Patients actifs</div>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100">
                    <div className="text-lg font-extrabold text-sky-700">{systemMetrics.consultationCount}</div>
                    <div className="text-[11px] text-slate-600 font-medium">Consultations</div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <div className="text-lg font-extrabold text-emerald-700">{systemMetrics.invoiceCount}</div>
                    <div className="text-[11px] text-slate-600 font-medium">Factures émises</div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                    <div className="text-lg font-extrabold text-amber-700">{systemMetrics.medicineCount}</div>
                    <div className="text-[11px] text-slate-600 font-medium">Médicaments</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                    <div className="text-lg font-extrabold text-purple-700">{systemMetrics.userCount}</div>
                    <div className="text-[11px] text-slate-600 font-medium">Collaborateurs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        {isAdmin && activeTab !== 'system' && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
