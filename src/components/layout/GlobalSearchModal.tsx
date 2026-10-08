'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, UserCheck, Pill, FileText, CreditCard, ArrowRight, Loader2 } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    patients: any[];
    doctors: any[];
    medicines: any[];
    prescriptions: any[];
    invoices: any[];
  }>({
    patients: [],
    doctors: [],
    medicines: [],
    prescriptions: [],
    invoices: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ patients: [], doctors: [], medicines: [], prescriptions: [], invoices: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ patients: [], doctors: [], medicines: [], prescriptions: [], invoices: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const hasResults =
    results.patients.length > 0 ||
    results.doctors.length > 0 ||
    results.medicines.length > 0 ||
    results.prescriptions.length > 0 ||
    results.invoices.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un patient, médecin, médicament, ordonnance, facture..."
            className="w-full bg-transparent px-3 py-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
          ) : query ? (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p>Commencez à saisir pour chercher dans toute la clinique.</p>
              <p className="text-xs text-slate-400 mt-1">Exemple: "Jean", "Doliprane", "ORD-2026", "Cardiologie"</p>
            </div>
          )}

          {query.trim().length >= 2 && !loading && !hasResults && (
            <div className="py-8 text-center text-slate-500 text-sm">
              Aucun résultat trouvé pour "{query}".
            </div>
          )}

          {/* Patients Section */}
          {results.patients.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Patients ({results.patients.length})</span>
              </div>
              <div className="space-y-1">
                {results.patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/patients/${p.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-blue-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600">
                          {p.lastName} {p.firstName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {p.patientNumber} • Tél: {p.phone}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Médecins Section */}
          {results.doctors.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Médecins ({results.doctors.length})</span>
              </div>
              <div className="space-y-1">
                {results.doctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigateTo(`/doctors`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-emerald-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                        Dr
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800 group-hover:text-emerald-700">
                          Dr. {d.user.firstName} {d.user.lastName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {d.specialty.name} • N° {d.licenseNumber}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Médicaments Section */}
          {results.medicines.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Pill className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pharmacie ({results.medicines.length})</span>
              </div>
              <div className="space-y-1">
                {results.medicines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigateTo(`/pharmacy/medicines`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-indigo-50/70 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-600">
                        {m.name} <span className="text-xs text-slate-500 font-normal">({m.genericName})</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Dosage: {m.dosage} • Forme: {m.form} • En stock: {m.currentStock}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {new Intl.NumberFormat('fr-FR').format(m.sellingPrice)} Ar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ordonnances Section */}
          {results.prescriptions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Ordonnances ({results.prescriptions.length})</span>
              </div>
              <div className="space-y-1">
                {results.prescriptions.map((rx) => (
                  <button
                    key={rx.id}
                    onClick={() => navigateTo(`/prescriptions`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-amber-50/70 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800 group-hover:text-amber-700">
                        {rx.prescriptionNumber}
                      </div>
                      <div className="text-xs text-slate-400">
                        Patient: {rx.patient.lastName} {rx.patient.firstName} • Dr. {rx.doctor.user.lastName}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Factures Section */}
          {results.invoices.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-cyan-500" />
                <span>Factures ({results.invoices.length})</span>
              </div>
              <div className="space-y-1">
                {results.invoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => navigateTo(`/invoices`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-cyan-50/70 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800 group-hover:text-cyan-700">
                        {inv.invoiceNumber} • Statut: {inv.status}
                      </div>
                      <div className="text-xs text-slate-400">
                        Patient: {inv.patient.lastName} {inv.patient.firstName}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {new Intl.NumberFormat('fr-FR').format(inv.totalAmount)} Ar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Recherche multi-entités sécurisée My Clinique</span>
          <button onClick={onClose} className="hover:text-slate-600">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
