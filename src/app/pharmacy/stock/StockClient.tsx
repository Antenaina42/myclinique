'use client';

import React, { useState } from 'react';
import { Plus, ArrowDownRight, ArrowUpRight, Package, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import MedicineSearchSelect from '@/components/pharmacy/MedicineSearchSelect';

interface StockClientProps {
  medicines: any[];
  suppliers: any[];
  initialEntries: any[];
  initialExits: any[];
}

export default function StockClient({
  medicines,
  suppliers,
  initialEntries,
  initialExits,
}: StockClientProps) {
  const [activeTab, setActiveTab] = useState<'entries' | 'exits'>('entries');
  const [entries, setEntries] = useState(initialEntries);
  const [exits, setExits] = useState(initialExits);

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Entry Form State
  const [entryForm, setEntryForm] = useState({
    medicineId: medicines[0]?.id || '',
    supplierId: suppliers[0]?.id || '',
    quantity: '20',
    unitCost: '5000',
    batchNumber: 'LOT-2026-A1',
    expiryDate: '2028-06-30',
    notes: 'Réception conforme bon de livraison.',
  });

  // Exit Form State
  const [exitForm, setExitForm] = useState({
    medicineId: medicines[0]?.id || '',
    quantity: '2',
    reason: 'EXPIRED',
    notes: 'Périmé en rayon',
  });

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/pharmacy/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ENTRY', ...entryForm }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l’entrée de stock');
        setLoading(false);
        return;
      }

      setEntries([data.entry, ...entries]);
      setShowEntryModal(false);
      setLoading(false);
    } catch (err: any) {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/pharmacy/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'EXIT', ...exitForm }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la sortie de stock');
        setLoading(false);
        return;
      }

      setExits([data.exit, ...exits]);
      setShowExitModal(false);
      setLoading(false);
    } catch (err: any) {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-slate-200/70 p-1">
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'entries'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Entrées Fournisseurs ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab('exits')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'exits'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sorties / Ajustements ({exits.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEntryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Entrée Stock</span>
          </button>

          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Déclarer Sortie</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Entries */}
      {activeTab === 'entries' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date Entrée</th>
                  <th className="py-3 px-4">Médicament</th>
                  <th className="py-3 px-4">Fournisseur</th>
                  <th className="py-3 px-4">N° de Lot</th>
                  <th className="py-3 px-4">Péremption</th>
                  <th className="py-3 px-4">Quantité</th>
                  <th className="py-3 px-4">Coût Unitaire</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Aucune entrée de stock répertoriée.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-500">
                        {formatDate(entry.entryDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{entry.medicine.name}</span>
                        <span className="text-[11px] text-slate-400">{entry.medicine.dosage}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {entry.supplier?.name || 'Achat direct'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {entry.batchNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(entry.expiryDate)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          +{entry.quantity} boîtes
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatCurrency(entry.unitCost)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-right">
                        {formatCurrency(entry.totalCost)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Exits */}
      {activeTab === 'exits' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date Sortie</th>
                  <th className="py-3 px-4">Médicament</th>
                  <th className="py-3 px-4">Quantité Déduite</th>
                  <th className="py-3 px-4">Motif</th>
                  <th className="py-3 px-4">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucune sortie de stock enregistrée.
                    </td>
                  </tr>
                ) : (
                  exits.map((exit) => (
                    <tr key={exit.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(exit.exitDate)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {exit.medicine.name} ({exit.medicine.dosage})
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          -{exit.quantity} boîtes
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {exit.reason === 'EXPIRED' ? 'Périmé' : exit.reason === 'DAMAGED' ? 'Avarié / Cassé' : 'Ajustement inventaire'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic">
                        {exit.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Entrée de Stock */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Nouvelle Entrée de Stock Fournisseur
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleEntrySubmit} className="space-y-3 text-xs">
              <MedicineSearchSelect
                label="Médicament à approvisionner"
                medicines={medicines}
                selectedId={entryForm.medicineId}
                onSelect={(id) => setEntryForm({ ...entryForm, medicineId: id })}
                placeholder="Rechercher par nom ou DCI..."
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fournisseur</label>
                <select
                  value={entryForm.supplierId}
                  onChange={(e) => setEntryForm({ ...entryForm, supplierId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantité (boîtes)</label>
                  <input
                    type="number"
                    min="1"
                    value={entryForm.quantity}
                    onChange={(e) => setEntryForm({ ...entryForm, quantity: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coût unitaire d'achat (Ar)</label>
                  <input
                    type="number"
                    value={entryForm.unitCost}
                    onChange={(e) => setEntryForm({ ...entryForm, unitCost: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Numéro de Lot</label>
                  <input
                    type="text"
                    value={entryForm.batchNumber}
                    onChange={(e) => setEntryForm({ ...entryForm, batchNumber: e.target.value })}
                    placeholder="LOT-..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date de péremption</label>
                  <input
                    type="date"
                    value={entryForm.expiryDate}
                    onChange={(e) => setEntryForm({ ...entryForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-60"
                >
                  {loading ? 'Validation...' : 'Valider l’Entrée'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sortie de Stock */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Déclarer une Sortie de Stock
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleExitSubmit} className="space-y-3 text-xs">
              <MedicineSearchSelect
                label="Médicament à déstocker"
                medicines={medicines}
                selectedId={exitForm.medicineId}
                onSelect={(id) => setExitForm({ ...exitForm, medicineId: id })}
                placeholder="Rechercher par nom ou DCI..."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantité à retirer</label>
                  <input
                    type="number"
                    min="1"
                    value={exitForm.quantity}
                    onChange={(e) => setExitForm({ ...exitForm, quantity: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Motif de sortie</label>
                  <select
                    value={exitForm.reason}
                    onChange={(e) => setExitForm({ ...exitForm, reason: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="EXPIRED">Médicament Périmé</option>
                    <option value="DAMAGED">Boîte Avariée ou Flacon Cassé</option>
                    <option value="INVENTORY_ADJUSTMENT">Ajustement d'Inventaire</option>
                    <option value="RETURN_TO_SUPPLIER">Retour au Fournisseur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Justification / Notes</label>
                <textarea
                  rows={2}
                  value={exitForm.notes}
                  onChange={(e) => setExitForm({ ...exitForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-60"
                >
                  {loading ? 'Validation...' : 'Valider la Sortie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
