'use client';

import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Building2,
  Calendar,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Award,
  History,
  Save,
  Check,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface ProfileUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  role: {
    id: string;
    name: string;
    displayName: string;
    description?: string | null;
  };
  clinic: {
    id: string;
    name: string;
    slogan?: string | null;
    currency: string;
    address?: string | null;
    phone?: string | null;
  };
  doctorProfile?: {
    id: string;
    licenseNumber: string;
    workingHours?: string | null;
    bio?: string | null;
    specialty?: {
      id: string;
      name: string;
    };
    _count?: {
      consultations: number;
      prescriptions: number;
      appointments: number;
    };
  } | null;
}

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  details?: string | null;
  createdAt: string;
  ipAddress?: string | null;
}

interface ProfileClientProps {
  user: ProfileUser;
  recentLogs: AuditLogItem[];
}

export default function ProfileClient({ user: initialUser, recentLogs }: ProfileClientProps) {
  const [user, setUser] = useState<ProfileUser>(initialUser);
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'doctor' | 'activity'>('info');

  // Personal Info Form State
  const [infoForm, setInfoForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    bio: user.doctorProfile?.bio || '',
    workingHours: user.doctorProfile?.workingHours || 'Lun - Ven: 08h00 - 17h00',
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState('');
  const [infoError, setInfoError] = useState('');

  // Password Form State
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const isDoctor = user.role.name === 'DOCTOR';

  // Handle Personal Info Update
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoSuccess('');
    setInfoError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: infoForm.firstName,
          lastName: infoForm.lastName,
          phone: infoForm.phone,
          bio: isDoctor ? infoForm.bio : undefined,
          workingHours: isDoctor ? infoForm.workingHours : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour');

      setUser((prev) => ({
        ...prev,
        firstName: infoForm.firstName,
        lastName: infoForm.lastName,
        phone: infoForm.phone,
        doctorProfile: prev.doctorProfile
          ? {
              ...prev.doctorProfile,
              bio: infoForm.bio,
              workingHours: infoForm.workingHours,
            }
          : null,
      }));

      setInfoSuccess('Informations personnelles mises à jour avec succès !');
      setTimeout(() => setInfoSuccess(''), 3000);
    } catch (err: any) {
      setInfoError(err.message || 'Une erreur est survenue');
    } finally {
      setInfoLoading(false);
    }
  };

  // Handle Password Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdSuccess('');
    setPwdError('');

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('Les deux nouveaux mots de passe ne correspondent pas.');
      setPwdLoading(false);
      return;
    }

    if (pwdForm.newPassword.length < 6) {
      setPwdError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      setPwdLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de mot de passe');

      setPwdSuccess('Votre mot de passe a été modifié avec succès !');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdSuccess(''), 4000);
    } catch (err: any) {
      setPwdError(err.message || 'Une erreur est survenue');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Profile Summary Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                {user.role.displayName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {user.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {user.clinic.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-xs text-slate-500">
          <div>
            <span className="block text-[11px] text-slate-400 font-medium">Compte créé le</span>
            <span className="font-semibold text-slate-800">{formatDate(user.createdAt)}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="block text-[11px] text-slate-400 font-medium">Dernière connexion</span>
            <span className="font-semibold text-slate-800">
              {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Session active'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('info')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Informations Personnelles</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Sécurité & Mot de Passe</span>
        </button>

        {isDoctor && (
          <button
            onClick={() => setActiveTab('doctor')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'doctor'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Fiche Praticien</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historique d'Activité</span>
        </button>
      </div>

      {/* Tab 1: Personal Info */}
      {activeTab === 'info' && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Coordonnées personnelles</h3>
            <p className="text-xs text-slate-500">
              Mettez à jour vos informations de contact visibles par vos collègues et patients
            </p>
          </div>

          {infoSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{infoSuccess}</span>
            </div>
          )}

          {infoError && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{infoError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateInfo} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={infoForm.firstName}
                  onChange={(e) => setInfoForm({ ...infoForm, firstName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={infoForm.lastName}
                  onChange={(e) => setInfoForm({ ...infoForm, lastName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse Email (Identifiant de connexion)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">L'email ne peut être changé que par un Super Admin.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  placeholder="+261 34 00 000 00"
                />
              </div>
            </div>

            {isDoctor && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Horaires habituels de consultation
                  </label>
                  <input
                    type="text"
                    value={infoForm.workingHours}
                    onChange={(e) => setInfoForm({ ...infoForm, workingHours: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    placeholder="Lun - Ven: 08h00 - 17h00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Présentation / Biographie médicale
                  </label>
                  <textarea
                    rows={3}
                    value={infoForm.bio}
                    onChange={(e) => setInfoForm({ ...infoForm, bio: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    placeholder="Parcours universitaire, sous-spécialités ou domaines d'intérêt..."
                  />
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={infoLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{infoLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Changer de mot de passe</h3>
            <p className="text-xs text-slate-500">
              Assurez la sécurité de votre compte en utilisant un mot de passe fort d'au moins 6 caractères
            </p>
          </div>

          {pwdSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          {pwdError && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nouveau mot de passe * (min. 6 caractères)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pwdLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{pwdLoading ? 'Mise à jour...' : 'Modifier le mot de passe'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Doctor Details (Conditional) */}
      {isDoctor && user.doctorProfile && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Attribution Médicale & Activité</h3>
            <p className="text-xs text-slate-500">
              Numéro d'ordre officiel, spécialité et volume d'actes médicaux enregistrés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Spécialité</span>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {user.doctorProfile.specialty?.name || 'Médecine Générale'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                N° Ordre : <strong className="text-slate-700">{user.doctorProfile.licenseNumber}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Planning de consultation</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-1">
                {user.doctorProfile.workingHours || 'Lun - Ven: 08h00 - 17h00'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Visites sans ou avec rendez-vous</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Activité Globale</span>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2 text-center">
                <div>
                  <div className="text-base font-extrabold text-emerald-700">
                    {user.doctorProfile._count?.consultations ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500">Consultations</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-blue-700">
                    {user.doctorProfile._count?.prescriptions ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500">Ordonnances</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-purple-700">
                    {user.doctorProfile._count?.appointments ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500">RDV</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Activity Log */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Journal d'Audit Personnel</h3>
            <p className="text-xs text-slate-500">
              Historique de vos dernières connexions et actions enregistrées par le système de sécurité
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entité</th>
                  <th className="py-3 px-4">Détails</th>
                  <th className="py-3 px-4">Adresse IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucune activité récente enregistrée
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 font-medium">{log.entity}</td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={log.details || ''}>
                        {log.details || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
