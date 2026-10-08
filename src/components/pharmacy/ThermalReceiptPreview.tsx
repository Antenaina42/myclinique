'use client';

import React, { useState } from 'react';
import {
  Printer,
  CheckCircle2,
  X,
  Sparkles,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import {
  ThermalReceiptData,
  printThermalReceipt,
  formatReceiptMoney,
  formatReceiptDateTime,
  formatPaymentMethod,
} from '@/lib/thermalReceipt';

interface ThermalReceiptPreviewProps {
  receiptData: ThermalReceiptData;
  onClose: () => void;
  isNewSale?: boolean;
}

export default function ThermalReceiptPreview({
  receiptData,
  onClose,
  isNewSale = true,
}: ThermalReceiptPreviewProps) {
  const [printing, setPrinting] = useState(false);

  const currency = receiptData.clinic?.currency || 'Ar';
  const clinicName = receiptData.clinic?.name || 'CLINIQUE MÉDICALE';
  const clinicSlogan = receiptData.clinic?.slogan || 'Pharmacie & Soins Médicaux';
  const clinicAddress = receiptData.clinic?.address || '';
  const clinicPhone = receiptData.clinic?.phone || '';
  const clinicTax = receiptData.clinic?.taxId || '';
  const clinicEmail = receiptData.clinic?.email || '';

  const cashier = receiptData.cashierName || 'Caisse Pharmacie';
  const customer = receiptData.customerName || 'Client de passage';
  const dateStr = formatReceiptDateTime(receiptData.saleDate);
  const paymentStr = formatPaymentMethod(receiptData.paymentMethod);

  const subtotal = Number(receiptData.subtotal || 0);
  const discount = Number(receiptData.discount || 0);
  const total = Number(receiptData.total || 0);
  const cashTendered = receiptData.cashTendered ? Number(receiptData.cashTendered) : null;
  const changeDue = receiptData.changeDue ? Number(receiptData.changeDue) : null;

  const totalQuantity = (receiptData.items || []).reduce((acc, item) => acc + item.quantity, 0);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printThermalReceipt(receiptData);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md my-auto bg-slate-900/90 rounded-2xl shadow-2xl border border-slate-700/60 p-4 sm:p-5 flex flex-col items-center">
        {/* Top Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header Notification */}
        {isNewSale && (
          <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Vente enregistrée & stock déduit avec succès</span>
          </div>
        )}

        <div className="text-center mb-3">
          <h2 className="text-white text-base font-black flex items-center justify-center gap-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <span>Format Ticket Thermique (80mm)</span>
          </h2>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Aperçu exact tel qu'il sera imprimé sur votre imprimante ticket
          </p>
        </div>

        {/* PHYSICAL THERMAL TICKET REPLICA */}
        <div className="w-full max-w-[320px] bg-[#fcfcfc] text-slate-900 rounded-lg shadow-2xl p-4 sm:p-5 font-mono text-[11px] leading-tight border border-slate-200 select-none relative overflow-hidden">
          {/* Subtle paper jagged edge decoration top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-repeat-x opacity-40 bg-[linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] bg-[size:8px_6px]" />

          {/* CLINIC HEADER (VRAIES INFOS DE LA CLINIQUE) */}
          <div className="text-center pt-1">
            <h3 className="font-black text-[13px] tracking-tight text-black uppercase">
              {clinicName}
            </h3>
            {clinicSlogan && (
              <p className="text-[9.5px] italic text-slate-600 mt-0.5">
                {clinicSlogan}
              </p>
            )}
            {clinicAddress && (
              <p className="text-[9.5px] text-slate-700 mt-1 leading-snug">
                {clinicAddress}
              </p>
            )}
            {clinicPhone && (
              <p className="text-[9.5px] text-slate-700 font-bold">
                Tél : {clinicPhone}
              </p>
            )}
            {clinicTax && (
              <p className="text-[9px] text-slate-800 font-semibold mt-0.5">
                {clinicTax}
              </p>
            )}
            {clinicEmail && (
              <p className="text-[8.5px] text-slate-500">
                {clinicEmail}
              </p>
            )}
          </div>

          {/* Double line separator */}
          <div className="border-t-2 border-b border-black my-2.5 py-0.5" />

          {/* TICKET NUMBER & METADATA */}
          <div className="text-center mb-2">
            <span className="inline-block border border-black px-2 py-0.5 font-bold text-[10px] tracking-wider uppercase">
              Ticket Pharmacie
            </span>
          </div>

          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Ticket N°:</span>
              <span className="font-bold text-black">{receiptData.saleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="font-bold text-black">{dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Caissier:</span>
              <span className="font-medium text-black">{cashier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Client:</span>
              <span className="font-bold text-black truncate max-w-[170px]">{customer}</span>
            </div>
            {receiptData.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-600">Tél:</span>
                <span className="font-medium text-black">{receiptData.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Mode Paiement:</span>
              <span className="font-bold text-black">{paymentStr}</span>
            </div>
            {receiptData.paymentReference && (
              <div className="flex justify-between">
                <span className="text-slate-600">Réf. Trans.:</span>
                <span className="font-bold text-blue-700">{receiptData.paymentReference}</span>
              </div>
            )}
          </div>

          {/* Dashed separator */}
          <div className="border-t border-dashed border-black my-2.5" />

          {/* TABLE HEADER */}
          <div className="flex justify-between font-bold text-[9.5px] uppercase border-b border-black pb-1 mb-1.5">
            <span>Désignation / Qté x PU</span>
            <span>Total</span>
          </div>

          {/* ITEMS LIST */}
          <div className="space-y-2 text-[10px]">
            {receiptData.items?.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-black leading-tight">
                  {item.medicineName}
                </div>
                <div className="flex justify-between text-slate-700 pl-1">
                  <span>
                    {item.quantity} x {formatReceiptMoney(item.unitPrice, currency)}
                  </span>
                  <span className="font-bold text-black">
                    {formatReceiptMoney(item.totalPrice, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dashed separator */}
          <div className="border-t border-dashed border-black my-2.5" />

          {/* TOTALS SECTION */}
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-700">
              <span>Articles ({totalQuantity}) :</span>
              <span>{formatReceiptMoney(subtotal, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Remise :</span>
                <span>-{formatReceiptMoney(discount, currency)}</span>
              </div>
            )}
          </div>

          {/* NET A PAYER BOX */}
          <div className="border-2 border-black p-1.5 my-2 flex justify-between items-center font-bold text-[12px] bg-slate-100/60">
            <span>NET À PAYER :</span>
            <span className="text-[13px]">{formatReceiptMoney(total, currency)}</span>
          </div>

          {/* CASH TENDERED & CHANGE */}
          {cashTendered !== null && cashTendered > 0 && (
            <div className="space-y-0.5 text-[10px] pt-0.5">
              <div className="flex justify-between text-slate-700">
                <span>Montant reçu :</span>
                <span>{formatReceiptMoney(cashTendered, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-black">
                <span>Monnaie rendue :</span>
                <span>{formatReceiptMoney(changeDue || 0, currency)}</span>
              </div>
            </div>
          )}

          {/* Dashed separator */}
          <div className="border-t border-dashed border-black my-2.5" />

          {/* BARCODE REPRESENTATION */}
          <div className="text-center my-2">
            <div className="flex justify-center items-center gap-[2px] h-9 mx-auto overflow-hidden">
              {Array.from({ length: 34 }).map((_, i) => {
                const isThick = (i % 3 === 0) || (i % 7 === 0);
                const isWide = i % 5 === 0;
                return (
                  <div
                    key={i}
                    className={`bg-black h-full ${
                      isThick ? 'w-[3px]' : isWide ? 'w-[2px]' : 'w-[1.5px]'
                    }`}
                  />
                );
              })}
            </div>
            <div className="text-[9px] font-bold tracking-widest text-black mt-1">
              *{receiptData.saleNumber}*
            </div>
          </div>

          {/* FOOTER POLITE & LEGAL NOTES */}
          <div className="text-center text-[9px] text-slate-600 space-y-1 mt-2">
            <p className="font-bold text-black text-[10px] tracking-wide">
              ★ MERCI DE VOTRE VISITE ★
            </p>
            <p className="font-bold text-slate-800">
              Bon rétablissement !
            </p>
            <p className="text-[8px] text-slate-500 leading-tight">
              Les médicaments ne sont ni repris ni échangés.<br />
              Conserver à l'abri de la chaleur (&lt; 25°C).
            </p>
            <p className="text-[7.5px] text-slate-400 pt-1 border-t border-slate-200">
              My Clinique POS System
            </p>
          </div>

          {/* Subtle paper jagged edge decoration bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-repeat-x opacity-40 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%)] bg-[size:8px_6px]" />
        </div>

        {/* ACTIONS BUTTONS */}
        <div className="w-full mt-4 flex items-center gap-2.5">
          <button
            type="button"
            disabled={printing}
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all transform active:scale-98 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{printing ? 'Impression en cours...' : 'Imprimer Ticket (80mm)'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {isNewSale ? 'Nouvelle Vente' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
}
