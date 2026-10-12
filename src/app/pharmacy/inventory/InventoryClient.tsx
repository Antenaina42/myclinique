'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  RefreshCw,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Boxes,
  MapPin,
  Barcode,
  Layers,
  Save,
  Pill,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  currentStock: number;
  minStockLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  location: string | null;
  barcode: string | null;
  expiryDate: string | null;
  category: {
    id: string;
    name: string;
  };
}

interface InventoryClientProps {
  initialMedicines: Medicine[];
  categories: { id: string; name: string }[];
  userRole: string;
  clinicName: string;
}

export default function InventoryClient({
  initialMedicines,
  categories,
  userRole,
  clinicName,
}: InventoryClientProps) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NORMAL' | 'LOW' | 'OUT' | 'EXPIRING' | 'EXPIRED'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Mode inventaire physique / saisie des écarts
  const [isCountingMode, setIsCountingMode] = useState(false);
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'CLINIC_ADMIN';

  // Obtenir la liste unique des emplacements
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    medicines.forEach((m) => {
      if (m.location && m.location.trim()) {
        locSet.add(m.location.trim());
      }
    });
    return Array.from(locSet).sort();
  }, [medicines]);

  // Dates de référence pour péremption
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  // Filtrage des médicaments
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // Recherche textuelle
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        med.name.toLowerCase().includes(q) ||
        med.genericName.toLowerCase().includes(q) ||
        (med.barcode && med.barcode.toLowerCase().includes(q)) ||
        (med.location && med.location.toLowerCase().includes(q));

      // Catégorie
      const matchCat = selectedCategory === 'ALL' || med.category.id === selectedCategory;

      // Emplacement
      const matchLoc = selectedLocation === 'ALL' || (med.location && med.location.trim() === selectedLocation);

      // Statut
      let matchStatus = true;
      const isOut = med.currentStock <= 0;
      const isLow = med.currentStock > 0 && med.currentStock <= med.minStockLevel;
      const isExpired = med.expiryDate ? new Date(med.expiryDate) <= now : false;
      const isExpiring =
        med.expiryDate ? new Date(med.expiryDate) > now && new Date(med.expiryDate) <= in30Days : false;

      if (statusFilter === 'OUT') matchStatus = isOut;
      else if (statusFilter === 'LOW') matchStatus = isLow;
      else if (statusFilter === 'EXPIRING') matchStatus = isExpiring;
      else if (statusFilter === 'EXPIRED') matchStatus = isExpired;
      else if (statusFilter === 'NORMAL') matchStatus = !isOut && !isLow && !isExpired;

      return matchSearch && matchCat && matchLoc && matchStatus;
    });
  }, [medicines, search, selectedCategory, selectedLocation, statusFilter]);

  // Statistiques d'inventaire globales
  const stats = useMemo(() => {
    let totalUnits = 0;
    let totalPurchaseVal = 0;
    let totalSellingVal = 0;
    let lowCount = 0;
    let outCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;

    medicines.forEach((m) => {
      totalUnits += m.currentStock;
      totalPurchaseVal += m.currentStock * m.purchasePrice;
      totalSellingVal += m.currentStock * m.sellingPrice;

      if (m.currentStock <= 0) outCount++;
      else if (m.currentStock <= m.minStockLevel) lowCount++;

      if (m.expiryDate) {
        const exp = new Date(m.expiryDate);
        if (exp <= now) expiredCount++;
        else if (exp <= in30Days) expiringCount++;
      }
    });

    return {
      totalRefs: medicines.length,
      totalUnits,
      totalPurchaseVal,
      totalSellingVal,
      lowCount,
      outCount,
      expiringCount,
      expiredCount,
    };
  }, [medicines]);

  // Initialiser les comptages physiques avec le stock théorique lorsqu'on active le mode
  const handleToggleCountingMode = () => {
    if (!isCountingMode) {
      const initialCounts: Record<string, number> = {};
      medicines.forEach((m) => {
        initialCounts[m.id] = m.currentStock;
      });
      setPhysicalCounts(initialCounts);
    }
    setIsCountingMode(!isCountingMode);
  };

  const handlePhysicalCountChange = (medId: string, val: string) => {
    const num = parseInt(val, 10);
    setPhysicalCounts((prev) => ({
      ...prev,
      [medId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  // Ajustement individuel pour un médicament
  const handleSaveSingleAdjustment = async (med: Medicine) => {
    const counted = physicalCounts[med.id];
    if (counted === undefined) return;
    const diff = counted - med.currentStock;
    if (diff === 0) {
      setNotification({ type: 'success', message: `${med.name} : stock conforme (aucun écart).` });
      return;
    }

    setSavingId(med.id);
    try {
      const res = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustments: [
            {
              medicineId: med.id,
              physicalStock: counted,
              note: `Inventaire physique manuel: ${med.currentStock} -> ${counted} (${diff > 0 ? '+' : ''}${diff})`,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’ajustement');

      setMedicines((prev) =>
        prev.map((m) => (m.id === med.id ? { ...m, currentStock: counted } : m))
      );
      setNotification({
        type: 'success',
        message: `Stock de ${med.name} ajusté avec succès (${counted} unités).`,
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setSavingId(null);
    }
  };

  // Enregistrer tous les écarts d'un coup
  const handleSaveAllAdjustments = async () => {
    const adjustmentsToSave: { medicineId: string; physicalStock: number; note: string }[] = [];

    medicines.forEach((med) => {
      const counted = physicalCounts[med.id];
      if (counted !== undefined && counted !== med.currentStock) {
        const diff = counted - med.currentStock;
        adjustmentsToSave.push({
          medicineId: med.id,
          physicalStock: counted,
          note: `Inventaire périodique: ${med.currentStock} -> ${counted} (${diff > 0 ? '+' : ''}${diff})`,
        });
      }
    });

    if (adjustmentsToSave.length === 0) {
      setNotification({ type: 'success', message: 'Aucun écart détecté à enregistrer.' });
      return;
    }

    if (!confirm(`Confirmez-vous l'ajustement de stock pour ${adjustmentsToSave.length} médicament(s) ?`)) {
      return;
    }

    setIsSavingAll(true);
    try {
      const res = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustments: adjustmentsToSave,
          notes: 'Validation globale de session d’inventaire physique',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la validation');

      // Mettre à jour l'état local
      setMedicines((prev) =>
        prev.map((m) => {
          const adj = adjustmentsToSave.find((a) => a.medicineId === m.id);
          return adj ? { ...m, currentStock: adj.physicalStock } : m;
        })
      );

      setNotification({
        type: 'success',
        message: `${adjustmentsToSave.length} référence(s) ajustée(s) et synchronisée(s) avec succès.`,
      });
      setIsCountingMode(false);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsSavingAll(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Code-Barres / Réf',
      'Nom Médicament',
      'Nom Générique (DCI)',
      'Catégorie',
      'Forme / Dosage',
      'Emplacement',
      'Stock Théorique',
      isAdmin ? 'Prix Achat (Ar)' : '',
      'Prix Vente (Ar)',
      isAdmin ? 'Valeur Stock Achat (Ar)' : '',
      'Valeur Stock Vente (Ar)',
      'Date Péremption',
      'Statut Stock',
    ].filter(Boolean);

    const rows = filteredMedicines.map((m) => {
      let st = 'Normal';
      if (m.currentStock <= 0) st = 'Rupture';
      else if (m.currentStock <= m.minStockLevel) st = 'Stock Faible';

      const row = [
        `"${m.barcode || m.id.substring(0, 8)}"`,
        `"${m.name.replace(/"/g, '""')}"`,
        `"${m.genericName.replace(/"/g, '""')}"`,
        `"${m.category.name.replace(/"/g, '""')}"`,
        `"${m.form} ${m.dosage}"`,
        `"${m.location || '-'}"`,
        m.currentStock,
        isAdmin ? m.purchasePrice : undefined,
        m.sellingPrice,
        isAdmin ? m.currentStock * m.purchasePrice : undefined,
        m.currentStock * m.sellingPrice,
        m.expiryDate ? formatDate(m.expiryDate) : 'N/A',
        st,
      ].filter((x) => x !== undefined);

      return row.join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Inventaire_Pharmacie_${clinicName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Impression de la fiche de comptage
  const handlePrintInventorySheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Notifications toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header avec boutons d'actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
            <span>/</span>
            <Link href="/pharmacy" className="hover:text-blue-600">Pharmacie</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">Inventaire</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight flex items-center gap-2.5">
            <span>Inventaire & Réconciliation Pharmacie</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Officine
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit physique des stocks, détection des écarts de comptage et valorisation patrimoniale
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleToggleCountingMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isCountingMode
                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-amber-500/20'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>{isCountingMode ? 'Quitter Saisie Comptage' : 'Démarrer Comptage Physique'}</span>
          </button>

          {isCountingMode && (
            <button
              onClick={handleSaveAllAdjustments}
              disabled={isSavingAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingAll ? 'Enregistrement...' : 'Valider Tous les Écarts'}</span>
            </button>
          )}

          <button
            onClick={handlePrintInventorySheet}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors"
            title="Imprimer la feuille de tournée d'inventaire"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Fiche Comptage</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors"
            title="Exporter l'inventaire au format Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 print:hidden">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Références</span>
            <Pill className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{stats.totalRefs}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{stats.totalUnits} unités physiques</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAdmin ? 'Valeur Achat' : 'Valeur Vente'}
            </span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            {formatCurrency(isAdmin ? stats.totalPurchaseVal : stats.totalSellingVal)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {isAdmin ? `Vente: ${formatCurrency(stats.totalSellingVal)}` : 'Tarif officiel clinique'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ruptures (0)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-600">{stats.outCount}</p>
          <p className="text-[11px] text-rose-500 font-medium mt-0.5">Réapprovisionnement urgent</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock Faible</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600">{stats.lowCount}</p>
          <p className="text-[11px] text-amber-500 font-medium mt-0.5">&le; Seuil de sécurité</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Péremptions &lt; 30j</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-extrabold text-purple-600">{stats.expiringCount}</p>
          <p className="text-[11px] text-purple-500 font-medium mt-0.5">
            {stats.expiredCount > 0 ? `${stats.expiredCount} déjà périmé(s)` : 'Rotation prioritaire'}
          </p>
        </div>
      </div>

      {/* Mode Saisie d'Inventaire : Bandeau d'assistance */}
      {isCountingMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Session de comptage physique en cours</p>
              <p className="text-amber-700 text-[11px]">
                Saisissez les quantités comptées sur vos étagères dans la colonne « Stock Physique ». L'écart théorique est calculé en temps réel.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveAllAdjustments}
            disabled={isSavingAll}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs shrink-0 self-end sm:self-auto"
          >
            {isSavingAll ? 'Validation...' : 'Enregistrer tous les écarts'}
          </button>
        </div>
      )}

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Champ recherche */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom commercial, DCI, code-barres ou rayon..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Filtre Catégorie */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Toutes les catégories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Emplacement / Rayon */}
          {locations.length > 0 && (
            <div className="w-full md:w-52">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Tous les emplacements</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Boutons de Filtre Rapide par Statut */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filtres :
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({medicines.length})
          </button>
          <button
            onClick={() => setStatusFilter('NORMAL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'NORMAL'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Stock Normal
          </button>
          <button
            onClick={() => setStatusFilter('LOW')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'LOW'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Stock Faible ({stats.lowCount})
          </button>
          <button
            onClick={() => setStatusFilter('OUT')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'OUT'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Rupture (0) ({stats.outCount})
          </button>
          <button
            onClick={() => setStatusFilter('EXPIRING')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'EXPIRING'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Péremption &lt; 30j ({stats.expiringCount})
          </button>
          {stats.expiredCount > 0 && (
            <button
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'EXPIRED'
                  ? 'bg-red-800 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              Périmés ({stats.expiredCount})
            </button>
          )}
        </div>
      </div>

      {/* En-tête officiel visible uniquement à l'impression */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase">{clinicName} — Pharmacie</h1>
            <p className="text-xs text-slate-500">FEUILLE DE TOURNÉE D'INVENTAIRE PHYSIQUE</p>
          </div>
          <div className="text-right text-xs">
            <p>Date : {new Date().toLocaleDateString('fr-FR')}</p>
            <p>Opérateur : ___________________________</p>
          </div>
        </div>
      </div>

      {/* Tableau d'Inventaire */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Réf / Emplacement</th>
                <th className="py-3.5 px-4">Médicament & DCI</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4 text-center">Théorique</th>
                {isCountingMode && (
                  <th className="py-3.5 px-4 text-center bg-amber-50/80 text-amber-900 border-x border-amber-200">
                    Physique Compté
                  </th>
                )}
                {isCountingMode && (
                  <th className="py-3.5 px-4 text-center bg-amber-50/80 text-amber-900 border-r border-amber-200">
                    Écart
                  </th>
                )}
                {/* Colonne réservée au comptage manuel à l'impression */}
                <th className="py-3.5 px-4 text-center hidden print:table-cell border-l">
                  Comptage Réel
                </th>
                {isAdmin && <th className="py-3.5 px-4 text-right">P. Achat</th>}
                <th className="py-3.5 px-4 text-right">P. Vente</th>
                <th className="py-3.5 px-4 text-right">Valeur Stock</th>
                <th className="py-3.5 px-4 text-center">Péremption</th>
                <th className="py-3.5 px-4 text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Aucun médicament ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const isOut = med.currentStock <= 0;
                  const isLow = med.currentStock > 0 && med.currentStock <= med.minStockLevel;
                  const isExpired = med.expiryDate ? new Date(med.expiryDate) <= now : false;
                  const isExpiring =
                    med.expiryDate ? new Date(med.expiryDate) > now && new Date(med.expiryDate) <= in30Days : false;

                  const counted = physicalCounts[med.id] !== undefined ? physicalCounts[med.id] : med.currentStock;
                  const diff = counted - med.currentStock;

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isOut ? 'bg-rose-50/30' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Emplacement / Réf */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{med.location || 'Rayon A'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {med.barcode || `#${med.id.substring(0, 6)}`}
                        </span>
                      </td>

                      {/* Médicament & DCI */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{med.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {med.genericName} • <span className="text-slate-400">{med.dosage} ({med.form})</span>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {med.category.name}
                        </span>
                      </td>

                      {/* Stock Théorique */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {med.currentStock}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Min: {med.minStockLevel}
                        </span>
                      </td>

                      {/* Mode Saisie Comptage Physique */}
                      {isCountingMode && (
                        <td className="py-2.5 px-3 text-center bg-amber-50/40 border-x border-amber-200/80">
                          <input
                            type="number"
                            min="0"
                            value={counted}
                            onChange={(e) => handlePhysicalCountChange(med.id, e.target.value)}
                            className="w-20 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                          />
                        </td>
                      )}

                      {/* Écart calculé */}
                      {isCountingMode && (
                        <td className="py-3 px-3 text-center bg-amber-50/40 border-r border-amber-200/80 font-mono font-bold">
                          {diff === 0 ? (
                            <span className="text-slate-400 font-semibold text-[11px]">0 (OK)</span>
                          ) : diff > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px]">
                              +{diff} surplus
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 text-[11px]">
                              {diff} manque
                            </span>
                          )}
                        </td>
                      )}

                      {/* Ligne vide pour comptage papier imprimable */}
                      <td className="py-3 px-4 text-center hidden print:table-cell border-l border-slate-300">
                        <div className="w-16 h-6 border-b-2 border-slate-400 mx-auto" />
                      </td>

                      {/* Prix d'Achat (Visible pour Admins uniquement) */}
                      {isAdmin && (
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          {formatCurrency(med.purchasePrice)}
                        </td>
                      )}

                      {/* Prix de Vente */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        {formatCurrency(med.sellingPrice)}
                      </td>

                      {/* Valeur Globale du Stock */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(med.currentStock * (isAdmin ? med.purchasePrice : med.sellingPrice))}
                      </td>

                      {/* Date de Péremption */}
                      <td className="py-3 px-4 text-center">
                        {med.expiryDate ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isExpired
                                ? 'bg-red-100 text-red-800 border border-red-200 font-bold'
                                : isExpiring
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'text-slate-600'
                            }`}
                          >
                            {formatDate(med.expiryDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Non définie</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center print:hidden">
                        {isCountingMode ? (
                          <button
                            onClick={() => handleSaveSingleAdjustment(med)}
                            disabled={savingId === med.id || diff === 0}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                              diff !== 0
                                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-2xs'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            title={diff !== 0 ? `Appliquer l'écart (${diff})` : 'Aucun écart'}
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <Link
                            href="/pharmacy/stock"
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            title="Créer une entrée ou sortie de stock"
                          >
                            Mouvement
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pied de tableau récapitulatif */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Affichage de <span className="font-bold text-slate-800">{filteredMedicines.length}</span> référence(s) sur un total de {medicines.length}.
          </div>
          <div className="flex items-center gap-4 text-slate-700">
            <span>
              Unités listées : <strong className="font-mono text-slate-900">{filteredMedicines.reduce((s, m) => s + m.currentStock, 0)}</strong>
            </span>
            <span>•</span>
            <span>
              Valeur totale sélectionnée :{' '}
              <strong className="font-mono text-emerald-700 font-bold">
                {formatCurrency(
                  filteredMedicines.reduce(
                    (s, m) => s + m.currentStock * (isAdmin ? m.purchasePrice : m.sellingPrice),
                    0
                  )
                )}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
