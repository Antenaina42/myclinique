'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Pill, AlertTriangle, X } from 'lucide-react';

export interface SearchMedicineItem {
  id: string;
  name: string;
  genericName?: string | null;
  dosage?: string | null;
  form?: string | null;
  currentStock: number;
}

interface MedicineSearchSelectProps {
  medicines: SearchMedicineItem[];
  selectedId: string;
  onSelect: (medicineId: string) => void;
  placeholder?: string;
  label?: string;
}

export default function MedicineSearchSelect({
  medicines,
  selectedId,
  onSelect,
  placeholder = 'Rechercher et sélectionner un médicament...',
  label,
}: MedicineSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedMedicine = useMemo(
    () => medicines.find((m) => m.id === selectedId),
    [medicines, selectedId]
  );

  const filteredMedicines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return medicines;
    return medicines.filter((m) => {
      const matchName = m.name?.toLowerCase().includes(q);
      const matchGeneric = m.genericName?.toLowerCase().includes(q);
      const matchDosage = m.dosage?.toLowerCase().includes(q);
      const matchForm = m.form?.toLowerCase().includes(q);
      return matchName || matchGeneric || matchDosage || matchForm;
    });
  }, [medicines, searchQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelectItem = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block font-semibold text-slate-700 mb-1 text-xs">
          {label}
        </label>
      )}

      {/* Main trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-colors bg-white ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {selectedMedicine ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Pill className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 truncate">
                {selectedMedicine.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {selectedMedicine.genericName ? `${selectedMedicine.genericName}` : ''}
                {selectedMedicine.dosage ? ` • ${selectedMedicine.dosage}` : ''}
                {selectedMedicine.form ? ` • ${selectedMedicine.form}` : ''}
              </div>
            </div>
            <span
              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                selectedMedicine.currentStock <= 5
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              Stock : {selectedMedicine.currentStock}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 font-normal">{placeholder}</span>
        )}

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100">
          {/* Search bar inside dropdown */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Taper un nom, DCI ou forme..."
              className="w-full bg-transparent text-xs py-1 text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 py-1">
            {filteredMedicines.length === 0 ? (
              <div className="py-6 px-4 text-center text-slate-400 text-xs">
                <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-500 opacity-60" />
                Aucun médicament trouvé pour "{searchQuery}"
              </div>
            ) : (
              filteredMedicines.map((m) => {
                const isSelected = m.id === selectedId;
                const isLow = m.currentStock <= 5;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectItem(m.id)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="truncate">{m.name}</span>
                        {m.dosage && (
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">
                            ({m.dosage})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {m.genericName && <span>DCI: {m.genericName}</span>}
                        {m.form && <span className="ml-1 text-slate-400">• {m.form}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isLow
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {m.currentStock} en stock
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
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
