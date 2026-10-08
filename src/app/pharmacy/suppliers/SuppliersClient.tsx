'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Building,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  PackageCheck,
  ShieldAlert,
} from 'lucide-react';
import { AuthUser } from '@/lib/auth';

interface Supplier {
  id: string;
  clinicId: string;
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  taxId?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: {
    stockEntries: number;
  };
}

interface SuppliersClientProps {
  initialSuppliers: Supplier[];
  user: AuthUser;
}

export default function SuppliersClient({
  initialSuppliers,
  user,
}: SuppliersClientProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    notes: '',
  });

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
        s.phone.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.taxId && s.taxId.toLowerCase().includes(q))
    );
  }, [suppliers, searchQuery]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxId: '',
      notes: '',
    });
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      taxId: supplier.taxId || '',
      notes: supplier.notes || '',
    });
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const isEdit = !!editingSupplier;
      const url = isEdit
        ? `/api/pharmacy/suppliers/${editingSupplier.id}`
        : '/api/pharmacy/suppliers';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’enregistrement');
      }

      if (isEdit) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === data.supplier.id ? data.supplier : s))
        );
        setSuccessMsg('Fournisseur mis à jour avec succès !');
      } else {
        setSuppliers((prev) => [data.supplier, ...prev]);
        setSuccessMsg('Fournisseur ajouté avec succès !');
      }

      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg('');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/pharmacy/suppliers/${supplierToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      setSuppliers((prev) => prev.filter((s) => s.id !== supplierToDelete.id));
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Impossible de supprimer ce fournisseur.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
            <span>/</span>
            <Link href="/pharmacy" className="hover:text-blue-600">Pharmacie</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">Fournisseurs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Fournisseurs Pharmaceutiques ({suppliers.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laboratoires, grossistes et distributeurs agréés pour l'approvisionnement en médicaments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau Fournisseur</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par laboratoire, délégué, téléphone, NIF..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium shrink-0">
          Affichage de <span className="font-bold text-slate-800">{filteredSuppliers.length}</span> sur {suppliers.length} fournisseur(s)
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Truck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Aucun fournisseur trouvé</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Aucun résultat ne correspond à "${searchQuery}". Essayez un autre terme de recherche.`
              : 'Commencez par ajouter votre premier fournisseur ou laboratoire pharmaceutique.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Créer un Fournisseur</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header card with name and actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate" title={sup.name}>
                        {sup.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {sup.contactPerson ? `Contact : ${sup.contactPerson}` : 'Direction commerciale'}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(sup)}
                      title="Modifier"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(sup)}
                      title="Supprimer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{sup.phone}</span>
                  </div>

                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{sup.email}</span>
                    </div>
                  )}

                  {sup.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{sup.address}</span>
                    </div>
                  )}

                  {sup.taxId && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {sup.taxId}
                      </span>
                    </div>
                  )}

                  {sup.notes && (
                    <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 border border-slate-100 line-clamp-2">
                      {sup.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer card */}
              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium">
                  <PackageCheck className="w-3.5 h-3.5 text-blue-500" />
                  {sup._count.stockEntries} livraison(s) reçue(s)
                </span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Partenaire Agréé
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Créer / Modifier un Fournisseur */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingSupplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingSupplier
                      ? 'Actualiser les coordonnées et conditions commerciales'
                      : 'Enregistrer un nouveau laboratoire ou grossiste pharmaceutique'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-5 space-y-4 overflow-y-auto text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom de la Société / Laboratoire <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Laboratoires SALAMA, Sopharmad, etc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Personne de Contact / Délégué
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dr. Rabe (Commercial)"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Téléphone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+261 20 22 123 45"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@laboratoire.mg"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Identifiant Fiscal (NIF / STAT)
                  </label>
                  <input
                    type="text"
                    placeholder="NIF: 1002345678 / STAT..."
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adresse Physique / Siège
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lot IVG 35 Anosivavaka, Antananarivo"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes & Conditions Commerciales
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Délai habituel 48h, franco de port à partir de 500 000 Ar, escompte 2%..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Enregistrement...' : editingSupplier ? 'Enregistrer les modifications' : 'Créer le fournisseur'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation de Suppression */}
      {deleteModalOpen && supplierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Supprimer le fournisseur ?</h3>
                <p className="text-xs text-slate-500">Cette action est irréversible.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Êtes-vous sûr de vouloir supprimer le fournisseur{' '}
              <strong className="text-slate-900 font-bold">{supplierToDelete.name}</strong> ?
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-60 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
