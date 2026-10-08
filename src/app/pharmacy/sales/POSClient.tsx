'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Printer,
  Receipt,
  DollarSign,
  Smartphone,
  CreditCard,
  Building,
  Loader2,
  History,
  Eye,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import ThermalReceiptPreview from '@/components/pharmacy/ThermalReceiptPreview';
import { ThermalReceiptData, printThermalReceipt } from '@/lib/thermalReceipt';

interface POSClientProps {
  clinic: any;
  currentUser: any;
  medicines: any[];
  patients: any[];
  initialSales: any[];
}

export default function POSClient({
  clinic,
  currentUser,
  medicines: initialMedicines,
  patients,
  initialSales,
}: POSClientProps) {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [sales, setSales] = useState(initialSales);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Cart State
  const [cart, setCart] = useState<Array<{
    medicineId: string;
    name: string;
    dosage: string;
    form: string;
    unitPrice: number;
    quantity: number;
    availableStock: number;
  }>>([]);

  // Customer State
  const [customerName, setCustomerName] = useState('Client de passage');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOBILE_MONEY' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [discount, setDiscount] = useState('0');
  const [cashTendered, setCashTendered] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedSaleReceipt, setCompletedSaleReceipt] = useState<ThermalReceiptData | null>(null);
  const [isNewSale, setIsNewSale] = useState(false);

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialMedicines.forEach((m) => {
      if (m.category?.name) set.add(m.category.name);
    });
    return Array.from(set);
  }, [initialMedicines]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchQuery =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || m.category?.name === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [medicines, searchQuery, selectedCategory]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
  }, [cart]);

  const totalAmount = useMemo(() => {
    const disc = parseFloat(discount || '0');
    return Math.max(0, subtotal - disc);
  }, [subtotal, discount]);

  const changeDue = useMemo(() => {
    const tendered = parseFloat(cashTendered || '0');
    if (tendered > totalAmount) {
      return tendered - totalAmount;
    }
    return 0;
  }, [cashTendered, totalAmount]);

  // Add to Cart with Stock Verification
  const addToCart = (med: any) => {
    setError('');
    if (med.currentStock <= 0) {
      setError(`Le médicament "${med.name}" est en rupture de stock.`);
      return;
    }

    const existingIndex = cart.findIndex((i) => i.medicineId === med.id);
    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.quantity + 1 > med.currentStock) {
        setError(`Quantité maximale atteinte pour "${med.name}". Stock disponible : ${med.currentStock}`);
        return;
      }
      setCart((prev) => {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      });
    } else {
      setCart((prev) => [
        ...prev,
        {
          medicineId: med.id,
          name: med.name,
          dosage: med.dosage,
          form: med.form,
          unitPrice: med.sellingPrice,
          quantity: 1,
          availableStock: med.currentStock,
        },
      ]);
    }
  };

  const updateQuantity = (medId: string, delta: number) => {
    setError('');
    const item = cart.find((i) => i.medicineId === medId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.medicineId !== medId));
      return;
    }

    if (newQty > item.availableStock) {
      setError(`Stock insuffisant. Maximum disponible : ${item.availableStock}`);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.medicineId === medId ? { ...i, quantity: newQty } : i))
    );
  };

  const removeFromCart = (medId: string) => {
    setCart((prev) => prev.filter((i) => i.medicineId !== medId));
  };

  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    if (patId) {
      const p = patients.find((pat) => pat.id === patId);
      if (p) {
        setCustomerName(`${p.lastName} ${p.firstName}`);
        setCustomerPhone(p.phone || '');
      }
    } else {
      setCustomerName('Client de passage');
      setCustomerPhone('');
    }
  };

  const handleCheckout = async () => {
    if (!cart.length) {
      setError('Le panier est vide.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/pharmacy/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          patientId: selectedPatientId || null,
          items: cart,
          paymentMethod,
          paymentReference: paymentMethod === 'MOBILE_MONEY' ? paymentReference : undefined,
          discount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la validation de la vente');
        setLoading(false);
        return;
      }

      // Update local medicine stocks
      setMedicines((prev) =>
        prev.map((m) => {
          const cartItem = cart.find((ci) => ci.medicineId === m.id);
          if (cartItem) {
            return { ...m, currentStock: m.currentStock - cartItem.quantity };
          }
          return m;
        })
      );

      const createdSale = data.sale;
      const tenderedVal = paymentMethod === 'CASH' && cashTendered ? parseFloat(cashTendered) : null;
      const changeVal = paymentMethod === 'CASH' ? changeDue : null;

      // Construction du ticket thermique avec les vraies informations dynamiques de la clinique
      const thermalReceipt: ThermalReceiptData = {
        clinic: {
          name: clinic?.name || 'CLINIQUE MÉDICALE',
          slogan: clinic?.slogan || 'La gestion intelligente de votre clinique',
          address: clinic?.address,
          phone: clinic?.phone,
          email: clinic?.email,
          website: clinic?.website,
          taxId: clinic?.taxId,
          currency: clinic?.currency || 'Ar',
        },
        saleNumber: createdSale.saleNumber,
        saleDate: createdSale.saleDate || new Date(),
        cashierName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Caisse Pharmacie',
        customerName: createdSale.customerName,
        customerPhone: createdSale.customerPhone,
        paymentMethod: createdSale.paymentMethod,
        paymentReference: createdSale.paymentReference,
        items: (createdSale.items || []).map((it: any) => ({
          medicineName: it.medicineName,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
        })),
        subtotal: createdSale.subtotal,
        discount: createdSale.discount,
        total: createdSale.total,
        cashTendered: tenderedVal,
        changeDue: changeVal,
      };

      setSales([createdSale, ...sales]);
      setCompletedSaleReceipt(thermalReceipt);
      setIsNewSale(true);
      setCart([]);
      setCashTendered('');
      setDiscount('0');
      setPaymentReference('');
      setLoading(false);
    } catch (err: any) {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  const handleOpenReprint = (sale: any) => {
    const thermalReceipt: ThermalReceiptData = {
      clinic: {
        name: clinic?.name || 'CLINIQUE MÉDICALE',
        slogan: clinic?.slogan || 'La gestion intelligente de votre clinique',
        address: clinic?.address,
        phone: clinic?.phone,
        email: clinic?.email,
        website: clinic?.website,
        taxId: clinic?.taxId,
        currency: clinic?.currency || 'Ar',
      },
      saleNumber: sale.saleNumber,
      saleDate: sale.saleDate,
      cashierName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Caisse Pharmacie',
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      paymentMethod: sale.paymentMethod,
      paymentReference: sale.paymentReference,
      items: (sale.items || []).map((it: any) => ({
        medicineName: it.medicineName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      cashTendered: null,
      changeDue: null,
    };
    setCompletedSaleReceipt(thermalReceipt);
    setIsNewSale(false);
  };

  const handleQuickPrint = (e: React.MouseEvent, sale: any) => {
    e.stopPropagation();
    const thermalReceipt: ThermalReceiptData = {
      clinic: {
        name: clinic?.name || 'CLINIQUE MÉDICALE',
        slogan: clinic?.slogan || 'La gestion intelligente de votre clinique',
        address: clinic?.address,
        phone: clinic?.phone,
        email: clinic?.email,
        website: clinic?.website,
        taxId: clinic?.taxId,
        currency: clinic?.currency || 'Ar',
      },
      saleNumber: sale.saleNumber,
      saleDate: sale.saleDate,
      cashierName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Caisse Pharmacie',
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      paymentMethod: sale.paymentMethod,
      paymentReference: sale.paymentReference,
      items: (sale.items || []).map((it: any) => ({
        medicineName: it.medicineName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      cashTendered: null,
      changeDue: null,
    };
    printThermalReceipt(thermalReceipt);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* POS Two Columns: Catalog (Left) & Cart / Checkout (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Medicine Catalog Search & Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search and Category Filter */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher médicament par nom ou DCI..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredMedicines.map((med) => {
              const inCart = cart.find((i) => i.medicineId === med.id);
              const isOutOfStock = med.currentStock <= 0;
              return (
                <div
                  key={med.id}
                  className={`p-4 bg-white rounded-xl border transition-all flex flex-col justify-between ${
                    isOutOfStock
                      ? 'opacity-60 border-slate-200 bg-slate-50'
                      : inCart
                      ? 'border-blue-400 shadow-xs ring-1 ring-blue-400'
                      : 'border-slate-200 shadow-xs hover:border-blue-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs line-clamp-1">
                        {med.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-800'
                          : med.currentStock <= med.minStockLevel
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOutOfStock ? 'Épuisé' : `${med.currentStock} dispo`}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {med.genericName} • {med.dosage}
                    </p>
                    <span className="inline-block text-[10px] text-slate-400 mt-1">
                      {med.form}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(med.sellingPrice)}
                    </span>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(med)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : inCart
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{inCart ? `Ajouté (${inCart.quantity})` : 'Ajouter'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Shopping Cart & Checkout (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Panier d'achat ({cart.length})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] text-rose-600 hover:underline font-semibold"
                >
                  Vider
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  Le panier est vide. Cliquez sur un médicament pour l'ajouter.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.medicineId} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <span className="text-[11px] text-slate-400">
                        {formatCurrency(item.unitPrice)} / unité
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, -1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.medicineId, 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-20 text-right font-bold text-slate-900">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.medicineId)}
                      className="text-slate-300 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Customer Information */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rattacher à un patient (Optionnel)
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">Client de passage non répertorié</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName} {p.firstName} ({p.patientNumber})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedPatientId && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Mode de règlement</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2 rounded-lg border text-center font-bold transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span>Espèces</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('MOBILE_MONEY')}
                  className={`p-2 rounded-lg border text-center font-bold transition-all ${
                    paymentMethod === 'MOBILE_MONEY'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                  <span>Mobile Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-2 rounded-lg border text-center font-bold transition-all ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
                  <span>Carte</span>
                </button>
              </div>

              {paymentMethod === 'MOBILE_MONEY' && (
                <div>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Référence transaction (ex: MVola TX-12345)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs mt-1"
                  />
                </div>
              )}

              {paymentMethod === 'CASH' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-0.5">Montant versé</label>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder="Montant reçu"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-right text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-0.5">Monnaie à rendre</label>
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 font-bold text-slate-800 text-right text-xs">
                      {formatCurrency(changeDue)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Remise</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24 px-2 py-0.5 rounded border border-slate-200 text-right text-xs"
                />
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                <span>Total à Payer</span>
                <span className="text-blue-700">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              disabled={loading || cart.length === 0}
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Traitement de la vente...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Encaisser et Imprimer Reçu ({formatCurrency(totalAmount)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Section Ventes Récentes & Réimpression de Tickets Thermiques */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Historique des Ventes & Réimpression de Tickets Thermiques ({sales.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Tickets au format 80mm réimprimables à tout moment pour les clients
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">N° Vente</th>
                <th className="px-4 py-3">Date & Heure</th>
                <th className="px-4 py-3">Client / Patient</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3">Règlement</th>
                <th className="px-4 py-3 text-right">Total Net</th>
                <th className="px-4 py-3 text-center">Ticket Thermique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Aucune vente enregistrée récemment.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id || s.saleNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {s.saleNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDateTime(s.saleDate)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {s.customerName || 'Client de passage'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {s.items?.length || 0} produit(s)
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {formatCurrency(s.total)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenReprint(s)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Prévisualiser le ticket de caisse"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Aperçu</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleQuickPrint(e, s)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                          title="Imprimer directement sur l'imprimante thermique"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer 80mm</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Reçu Thermique 80mm Modal After Sale / On Reprint */}
      {completedSaleReceipt && (
        <ThermalReceiptPreview
          receiptData={completedSaleReceipt}
          onClose={() => setCompletedSaleReceipt(null)}
          isNewSale={isNewSale}
        />
      )}
    </div>
  );
}
