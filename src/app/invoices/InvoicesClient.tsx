'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Download, DollarSign, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/formatters';

interface InvoicesClientProps {
  initialInvoices: any[];
}

export default function InvoicesClient({ initialInvoices }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOBILE_MONEY' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'ALL') return true;
    return inv.status === statusFilter;
  });

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balance.toString());
    setPaymentMethod('CASH');
    setPaymentReference('');
    setError('');
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          reference: paymentReference,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur enregistrement règlement');
        setLoading(false);
        return;
      }

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === selectedInvoice.id ? data.invoice : inv))
      );
      setSelectedInvoice(null);
      setLoading(false);
    } catch (err: any) {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'UNPAID', 'PARTIALLY_PAID', 'PAID'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL'
              ? 'Toutes les factures'
              : st === 'UNPAID'
              ? 'Impayées'
              : st === 'PARTIALLY_PAID'
              ? 'Paiement partiel'
              : 'Payées'}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Prestations</th>
                <th className="py-3 px-4">Montant Total</th>
                <th className="py-3 px-4">Déjà Réglé</th>
                <th className="py-3 px-4">Solde Dû</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Aucune facture trouvée.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(inv.issuedDate)}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/patients/${inv.patientId}`}
                          className="font-bold text-slate-900 hover:text-blue-600"
                        >
                          {inv.patient.lastName} {inv.patient.firstName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate">
                        {inv.items.map((i: any) => i.description).join(', ') || 'Consultation'}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
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
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.balance > 0 && (
                            <button
                              type="button"
                              onClick={() => openPaymentModal(inv)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            >
                              Encaisser
                            </button>
                          )}

                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title="Télécharger Facture PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Encaisser Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Encaisser le règlement
              </h3>
              <p className="text-xs text-slate-500">
                Facture {selectedInvoice.invoiceNumber} • Patient : {selectedInvoice.patient.lastName} {selectedInvoice.patient.firstName}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Montant à régler (Ar) — Reste dû : {formatCurrency(selectedInvoice.balance)}
                </label>
                <input
                  type="number"
                  max={selectedInvoice.balance}
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mode de règlement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2 rounded-lg border text-center font-bold transition-all ${
                      paymentMethod === 'CASH'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Espèces
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOBILE_MONEY')}
                    className={`p-2 rounded-lg border text-center font-bold transition-all ${
                      paymentMethod === 'MOBILE_MONEY'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-2 rounded-lg border text-center font-bold transition-all ${
                      paymentMethod === 'CREDIT_CARD'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Carte
                  </button>
                </div>
              </div>

              {paymentMethod === 'MOBILE_MONEY' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Référence MVola / Orange Money / Airtel
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="TX-..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-60"
                >
                  {loading ? 'Validation...' : 'Valider le paiement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
