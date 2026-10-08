'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Plus, Trash2, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceFormClientProps {
  patients: any[];
  initialPatientId: string;
}

export default function InvoiceFormClient({ patients, initialPatientId }: InvoiceFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [patientId, setPatientId] = useState(initialPatientId || (patients[0]?.id || ''));
  const [discountAmount, setDiscountAmount] = useState('0');
  const [notes, setNotes] = useState('Prestations médicales de consultation et soins.');

  const [items, setItems] = useState<Array<{
    description: string;
    itemType: string;
    quantity: number;
    unitPrice: string;
  }>>([
    {
      description: 'Consultation de Médecine Générale',
      itemType: 'CONSULTATION',
      quantity: 1,
      unitPrice: '35000',
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: 'Examen complémentaire / Acte médical',
        itemType: 'MEDICAL_PROCEDURE',
        quantity: 1,
        unitPrice: '25000',
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce(
    (acc, it) => acc + (parseFloat(it.unitPrice || '0') * (it.quantity || 1)),
    0
  );
  const discount = parseFloat(discountAmount || '0');
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          discountAmount,
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création de la facture');
        setLoading(false);
        return;
      }

      router.push('/invoices');
      router.refresh();
    } catch (err: any) {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Patient à facturer *</label>
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

      {/* Invoice Lines */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-800 text-sm">Lignes de Prestation</span>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une prestation</span>
          </button>
        </div>

        {items.map((it, idx) => (
          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={it.description}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItems((prev) => {
                      const copy = [...prev];
                      copy[idx].description = val;
                      return copy;
                    });
                  }}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Prix unitaire (Ar)</label>
                <input
                  type="number"
                  value={it.unitPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItems((prev) => {
                      const copy = [...prev];
                      copy[idx].unitPrice = val;
                      return copy;
                    });
                  }}
                  required
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-right"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-slate-600 font-medium mb-1">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value || '1', 10);
                      setItems((prev) => {
                        const copy = [...prev];
                        copy[idx].quantity = val;
                        return copy;
                      });
                    }}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-center"
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Remise & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Remise commerciale (Ar)</label>
          <input
            type="number"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-right"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Observations sur la facture</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200"
          />
        </div>
      </div>

      {/* Total Card */}
      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
        <div>
          <span className="text-slate-500 block">Total Facturé</span>
          <span className="text-xl font-extrabold text-blue-900">{formatCurrency(total)}</span>
        </div>
        <span className="text-[11px] text-blue-700 font-semibold">Statut initial : Impayée</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link
          href="/invoices"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Annuler</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-500/20 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Création...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Émettre la Facture</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
