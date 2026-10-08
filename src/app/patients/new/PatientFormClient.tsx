'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  ShieldAlert,
  Save,
  Loader2,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

interface PatientFormClientProps {
  doctors: any[];
}

export default function PatientFormClient({ doctors }: PatientFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    birthDate: '',
    bloodGroup: 'O+',
    phone: '+261 34 ',
    email: '',
    address: '',
    city: 'Antananarivo',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRel: '',
    primaryDoctorId: doctors[0]?.id || '',
    // Medical record
    allergies: '',
    chronicDiseases: '',
    surgicalHistory: '',
    familyHistory: '',
    habits: '',
    generalNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l’enregistrement.');
        setLoading(false);
        return;
      }

      setSuccess(`Patient ${data.patient.lastName} ${data.patient.firstName} enregistré avec succès !`);
      setTimeout(() => {
        router.push(`/patients/${data.patient.id}`);
      }, 1000);
    } catch (err: any) {
      setError('Erreur réseau.');
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold">
          {success}
        </div>
      )}

      {/* Section 1: Identité & État Civil */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            1. Identité & État Civil du Patient
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nom de famille *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="ex: Ravalomanana"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Prénom(s) *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="ex: Jean-Baptiste"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sexe biologique *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="MALE">Masculin</option>
              <option value="FEMALE">Féminin</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date de naissance *</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Groupe Sanguin</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="O+">O Rhésus Positif (O+)</option>
              <option value="O-">O Rhésus Négatif (O-)</option>
              <option value="A+">A Rhésus Positif (A+)</option>
              <option value="A-">A Rhésus Négatif (A-)</option>
              <option value="B+">B Rhésus Positif (B+)</option>
              <option value="B-">B Rhésus Négatif (B-)</option>
              <option value="AB+">AB Rhésus Positif (AB+)</option>
              <option value="AB-">AB Rhésus Négatif (AB-)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Médecin Référent Traitant</label>
            <select
              name="primaryDoctorId"
              value={formData.primaryDoctorId}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">-- Aucun médecin assigné --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.user.lastName} {doc.user.firstName} ({doc.specialty.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Coordonnées & Urgence */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Phone className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            2. Coordonnées & Contact d'Urgence
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Téléphone Principal *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email personnel</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="patient@exemple.mg"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Adresse de domicile</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Lot..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ville</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Contact en cas d'urgence
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="ex: Rasoa Hélène"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone urgence</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+261 34..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lien de parenté</label>
                <input
                  type="text"
                  name="emergencyContactRel"
                  value={formData.emergencyContactRel}
                  onChange={handleChange}
                  placeholder="Épouse, Père, Sœur..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Antécédents Médicaux Initiaux */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            3. Dossier Médical & Antécédents
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Allergies connues (médicamenteuses ou alimentaires)
            </label>
            <textarea
              name="allergies"
              rows={2}
              value={formData.allergies}
              onChange={handleChange}
              placeholder="ex: Pénicilline, Aspirine, Arachides..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Maladies chroniques ou affections de longue durée
            </label>
            <textarea
              name="chronicDiseases"
              rows={2}
              value={formData.chronicDiseases}
              onChange={handleChange}
              placeholder="ex: Diabète type 2, Asthme, Hypertension..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Antécédents chirurgicaux / Opérations
            </label>
            <textarea
              name="surgicalHistory"
              rows={2}
              value={formData.surgicalHistory}
              onChange={handleChange}
              placeholder="ex: Appendicectomie 2018..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Habitudes de vie & Toxiques
            </label>
            <textarea
              name="habits"
              rows={2}
              value={formData.habits}
              onChange={handleChange}
              placeholder="ex: Non-fumeur, Alcool occasionnel, Sport..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/patients"
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
              <span>Enregistrer le patient</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
