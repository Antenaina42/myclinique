'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Stethoscope,
  Pill,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock,
  Mail,
  Phone,
  Clock,
  Award,
  AlertCircle,
  X,
  KeyRound,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
}

interface Specialty {
  id: string;
  name: string;
}

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  role: Role;
  doctorProfile?: {
    id: string;
    licenseNumber: string;
    workingHours?: string | null;
    bio?: string | null;
    specialty?: {
      id: string;
      name: string;
    };
  } | null;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  roles: Role[];
  specialties: Specialty[];
  currentUserRole: string;
  currentUserId: string;
}

export default function UsersClient({
  initialUsers,
  roles,
  specialties,
  currentUserRole,
  currentUserId,
}: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    roleId: roles[0]?.id || '',
    specialtyId: specialties[0]?.id || '',
    licenseNumber: '',
    workingHours: 'Lun - Ven: 08h00 - 17h00',
    bio: '',
    isActive: true,
  });

  const canManageUsers = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'CLINIC_ADMIN';

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const doctorsCount = users.filter((u) => u.role.name === 'DOCTOR').length;
  const adminCount = users.filter((u) => u.role.name === 'SUPER_ADMIN' || u.role.name === 'CLINIC_ADMIN').length;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));

    const matchesRole = selectedRole === 'ALL' || u.role.name === selectedRole;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && u.isActive) ||
      (selectedStatus === 'INACTIVE' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CLINIC_ADMIN':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'NURSE':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'PHARMACIST':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'RECEPTIONIST':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ACCOUNTANT':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      roleId: roles.find((r) => r.name === 'DOCTOR')?.id || roles[0]?.id || '',
      specialtyId: specialties[0]?.id || '',
      licenseNumber: '',
      workingHours: 'Lun - Ven: 08h00 - 17h00',
      bio: '',
      isActive: true,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (u: UserItem) => {
    setEditingUser(u);
    setFormData({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone || '',
      password: '',
      roleId: u.role.id,
      specialtyId: u.doctorProfile?.specialty?.id || specialties[0]?.id || '',
      licenseNumber: u.doctorProfile?.licenseNumber || '',
      workingHours: u.doctorProfile?.workingHours || 'Lun - Ven: 08h00 - 17h00',
      bio: u.doctorProfile?.bio || '',
      isActive: u.isActive,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setModalOpen(true);
  };

  const selectedRoleObj = roles.find((r) => r.id === formData.roleId);
  const isDoctorRole = selectedRoleObj?.name === 'DOCTOR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (editingUser) {
        // Edit User
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            isActive: formData.isActive,
            roleId: formData.roleId,
            password: formData.password || undefined,
            specialtyId: isDoctorRole ? formData.specialtyId : undefined,
            licenseNumber: isDoctorRole ? formData.licenseNumber : undefined,
            workingHours: isDoctorRole ? formData.workingHours : undefined,
            bio: isDoctorRole ? formData.bio : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour');

        // Update local state
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === editingUser.id) {
              const matchedRole = roles.find((r) => r.id === formData.roleId) || u.role;
              const matchedSpecialty = specialties.find((s) => s.id === formData.specialtyId);
              return {
                ...u,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                isActive: formData.isActive,
                role: matchedRole,
                doctorProfile: isDoctorRole
                  ? {
                      id: u.doctorProfile?.id || 'new',
                      licenseNumber: formData.licenseNumber,
                      workingHours: formData.workingHours,
                      bio: formData.bio,
                      specialty: matchedSpecialty ? { id: matchedSpecialty.id, name: matchedSpecialty.name } : undefined,
                    }
                  : null,
              };
            }
            return u;
          })
        );

        setSuccessMsg('Collaborateur mis à jour avec succès !');
        setTimeout(() => setModalOpen(false), 1200);
      } else {
        // Create User
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors de la création');

        // Refresh user list from server
        const refreshRes = await fetch('/api/users');
        const refreshData = await refreshRes.json();
        if (refreshData.users) {
          setUsers(refreshData.users);
        }

        setSuccessMsg('Nouveau compte collaborateur créé avec succès !');
        setTimeout(() => setModalOpen(false), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userToToggle: UserItem) => {
    if (!canManageUsers) return;
    if (userToToggle.id === currentUserId) {
      alert('Vous ne pouvez pas désactiver votre propre compte.');
      return;
    }

    const nextState = !userToToggle.isActive;
    const confirmText = nextState
      ? `Voulez-vous réactiver le compte de ${userToToggle.firstName} ${userToToggle.lastName} ?`
      : `Voulez-vous désactiver le compte de ${userToToggle.firstName} ${userToToggle.lastName} ?`;

    if (!confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/users/${userToToggle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la modification');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userToToggle.id ? { ...u, isActive: nextState } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Collaborateurs</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{totalUsers}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Comptes Actifs</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{activeUsers}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Corps Médical (Médecins)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{doctorsCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Administrateurs</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{adminCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">Tous les rôles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs uniquement</option>
            <option value="INACTIVE">Inactifs uniquement</option>
          </select>
        </div>

        {canManageUsers && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau collaborateur</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Rôle & Droits</th>
                <th className="py-3 px-4">Spécialité / N° Ordre</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Dernière Connexion</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Aucun collaborateur trouvé avec ces critères
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isDoctor = u.role.name === 'DOCTOR';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-200">
                            {u.firstName[0]}
                            {u.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {u.email}
                              </span>
                              {u.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                            u.role.name
                          )}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {u.role.displayName}
                        </span>
                      </td>

                      {/* Doctor Details */}
                      <td className="py-3 px-4">
                        {isDoctor && u.doctorProfile ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <Award className="w-3 h-3 text-blue-600" />
                              {u.doctorProfile.specialty?.name || 'Généraliste'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              N° {u.doctorProfile.licenseNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Inactif
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {u.lastLoginAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(u.lastLoginAt)}
                          </div>
                        ) : (
                          <span className="text-slate-400">Jamais</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageUsers && (
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              title="Modifier"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {canManageUsers && u.id !== currentUserId && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title={u.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.isActive
                                  ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.isActive ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
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

      {/* Modal Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingUser ? 'Modifier le Collaborateur' : 'Ajouter un Collaborateur'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingUser
                    ? `Modification des accès de ${editingUser.firstName} ${editingUser.lastName}`
                    : 'Créez un compte pour un médecin, soignant ou membre administratif'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingUser)}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="dr.dupont@myclinique.mg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    placeholder="+261 34 00 000 00"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rôle & Habilitation *
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.displayName} — {r.description || r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingUser
                    ? 'Nouveau mot de passe (laisser vide pour ne pas changer)'
                    : 'Mot de passe initial *'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={!editingUser}
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                    placeholder={editingUser ? '••••••••' : 'Minimum 6 caractères'}
                  />
                </div>
              </div>

              {/* Doctor Specific Fields (conditional) */}
              {isDoctorRole && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>Détails du profil Médecin</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Spécialité médicale *
                      </label>
                      <select
                        value={formData.specialtyId}
                        onChange={(e) => setFormData({ ...formData, specialtyId: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-200 bg-white focus:outline-hidden focus:border-blue-500"
                      >
                        {specialties.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        N° Ordre des Médecins *
                      </label>
                      <input
                        type="text"
                        required={isDoctorRole}
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-hidden focus:border-blue-500"
                        placeholder="MED-12345"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Horaires de consultation
                    </label>
                    <input
                      type="text"
                      value={formData.workingHours}
                      onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-hidden focus:border-blue-500"
                      placeholder="Lun - Ven: 08h00 - 17h00"
                    />
                  </div>
                </div>
              )}

              {/* Active Toggle (Edit mode) */}
              {editingUser && editingUser.id !== currentUserId && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700">
                    Compte actif (autorisé à se connecter à la clinique)
                  </label>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : editingUser ? 'Mettre à jour' : 'Créer le collaborateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
