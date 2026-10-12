'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, User, Phone, X } from 'lucide-react';

export interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber?: string | null;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | Date | null;
  bloodGroup?: string | null;
}

interface PatientSelectProps {
  patients: PatientOption[];
  value: string;
  onChange: (patientId: string, patient?: PatientOption) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  clearLabel?: string;
}

export default function PatientSelect({
  patients,
  value,
  onChange,
  label,
  placeholder = 'Sélectionner un patient...',
  required = false,
  disabled = false,
  className = '',
  allowClear = false,
  clearLabel = 'Aucun patient sélectionné',
}: PatientSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected patient
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === value);
  }, [patients, value]);

  // Filtered patients based on search
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase().trim();
    return patients.filter((p) => {
      const fullName = `${p.lastName} ${p.firstName}`.toLowerCase();
      const num = (p.patientNumber || '').toLowerCase();
      const phone = (p.phone || '').toLowerCase();
      return fullName.includes(q) || num.includes(q) || phone.includes(q);
    });
  }, [patients, search]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = (patient: PatientOption) => {
    onChange(patient.id, patient);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Hidden input for HTML form validation */}
      <input
        type="text"
        value={value}
        required={required}
        readOnly
        className="sr-only"
        tabIndex={-1}
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 text-left rounded-xl border transition-all flex items-center justify-between text-xs bg-white ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
            : 'border-slate-200 hover:border-slate-300 shadow-2xs'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
      >
        {selectedPatient ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-blue-200">
              {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-800">
                {selectedPatient.lastName.toUpperCase()} {selectedPatient.firstName}
              </span>
              {selectedPatient.patientNumber && (
                <span className="ml-1.5 font-mono text-[10px] text-slate-500 font-semibold">
                  ({selectedPatient.patientNumber})
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-slate-400 italic">{placeholder}</span>
        )}

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {allowClear && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              title="Désélectionner"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn text-xs">
          {/* FIRST LINE: SEARCH INPUT */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, n° patient ou tél..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Patients Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100/80">
            {allowClear && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 flex items-center justify-between text-left transition-colors ${
                  !value ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-500 italic'
                }`}
              >
                <span>{clearLabel}</span>
                {!value && <Check className="w-4 h-4 text-slate-600 shrink-0 ml-2" />}
              </button>
            )}
            {filteredPatients.length === 0 ? (
              <div className="py-6 text-center text-slate-400 italic text-[11px]">
                Aucun patient trouvé pour "{search}"
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = p.id === value;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={`w-full p-2.5 flex items-center justify-between text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-900 font-bold'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-[10px] shrink-0 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div className="truncate leading-tight">
                        <div className="truncate font-bold">
                          {p.lastName.toUpperCase()} {p.firstName}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {p.patientNumber && (
                            <span className="font-mono text-slate-500 font-semibold">{p.patientNumber}</span>
                          )}
                          {p.phone && (
                            <>
                              <span>•</span>
                              <span>{p.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
