'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  UserCheck,
  FileText,
  Pill,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { AuthUser } from '@/types';
import { getRoleBadgeLabel } from '@/lib/permissions';

interface SidebarProps {
  user: AuthUser;
  clinicName?: string;
  isOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

export default function Sidebar({ user, clinicName, isOpen, onToggle, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const roleInfo = getRoleBadgeLabel(user.role);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    patients: pathname.startsWith('/patients'),
    appointments: pathname.startsWith('/appointments'),
    consultations: pathname.startsWith('/consultations'),
    pharmacy: pathname.startsWith('/pharmacy'),
    invoices: pathname.startsWith('/invoices') || pathname.startsWith('/payments'),
  });

  const toggleSubmenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Construction dynamique des sections du menu selon le rôle de l'utilisateur
  const menuSections = useMemo(() => {
    switch (user.role) {
      // 1. COMPTE ACCUEIL / RÉCEPTION : RDV, Patients, Disponibilités médecins uniquement
      case 'RECEPTIONIST':
        return [
          {
            title: 'ESPACE ACCUEIL',
            items: [
              {
                label: 'Tableau de bord',
                href: '/dashboard',
                icon: LayoutDashboard,
                badge: 'Accueil',
              },
            ],
          },
          {
            title: 'ACCUEIL & RENDEZ-VOUS',
            items: [
              {
                key: 'appointments',
                label: 'Rendez-vous',
                icon: Calendar,
                href: '/appointments',
                subItems: [
                  { label: 'Calendrier des RDV', href: '/appointments' },
                  { label: 'Nouveau rendez-vous', href: '/appointments/new', icon: PlusCircle },
                ],
              },
              {
                key: 'patients',
                label: 'Patients',
                icon: Users,
                href: '/patients',
                subItems: [
                  { label: 'Tous les patients', href: '/patients' },
                  { label: 'Ajouter un patient', href: '/patients/new', icon: PlusCircle },
                ],
              },
              {
                label: 'Médecins & Dispos',
                href: '/doctors',
                icon: UserCheck,
              },
            ],
          },
        ];

      // 2. COMPTE PHARMACIE : Gestion pharmacie, catalogue, stocks, caisse POS, ordonnances uniquement
      case 'PHARMACIST':
        return [
          {
            title: 'ESPACE PHARMACIE',
            items: [
              {
                label: 'Tableau de bord',
                href: '/dashboard',
                icon: LayoutDashboard,
                badge: 'Pharma',
              },
            ],
          },
          {
            title: 'PHARMACIE & STOCKS',
            items: [
              {
                key: 'pharmacy',
                label: 'Pharmacie',
                icon: Pill,
                href: '/pharmacy',
                subItems: [
                  { label: 'Vue d’ensemble', href: '/pharmacy' },
                  { label: 'Catalogue Médicaments', href: '/pharmacy/medicines' },
                  { label: 'Stocks & Mouvements', href: '/pharmacy/stock' },
                  { label: 'Caisse Ventes (POS)', href: '/pharmacy/sales' },
                  { label: 'Fournisseurs', href: '/pharmacy/suppliers' },
                ],
              },
              {
                label: 'Ordonnances à délivrer',
                href: '/prescriptions',
                icon: FileText,
              },
            ],
          },
        ];

      // 3. COMPTE MÉDECIN : Consultations, dossiers médicaux, son agenda, ses ordonnances, confrères
      case 'DOCTOR':
        return [
          {
            title: 'ESPACE PRATICIEN',
            items: [
              {
                label: 'Tableau de bord',
                href: '/dashboard',
                icon: LayoutDashboard,
                badge: 'Dr',
              },
            ],
          },
          {
            title: 'ACTIVITÉ MÉDICALE',
            items: [
              {
                key: 'consultations',
                label: 'Consultations',
                icon: Stethoscope,
                href: '/consultations',
                subItems: [
                  { label: 'Toutes les consultations', href: '/consultations' },
                  { label: 'Nouvelle consultation', href: '/consultations/new', icon: PlusCircle },
                ],
              },
              {
                key: 'patients',
                label: 'Dossiers Patients',
                icon: Users,
                href: '/patients',
                subItems: [
                  { label: 'Liste des patients', href: '/patients' },
                  { label: 'Nouveau patient', href: '/patients/new', icon: PlusCircle },
                ],
              },
              {
                key: 'appointments',
                label: 'Mon Agenda RDV',
                icon: Calendar,
                href: '/appointments',
                subItems: [
                  { label: 'Mes rendez-vous', href: '/appointments' },
                  { label: 'Nouveau rendez-vous', href: '/appointments/new', icon: PlusCircle },
                ],
              },
              {
                label: 'Ordonnances',
                href: '/prescriptions',
                icon: FileText,
              },
              {
                label: 'Confrères Médecins',
                href: '/doctors',
                icon: UserCheck,
              },
            ],
          },
        ];

      // 4. COMPTE INFIRMIER : Patients, Constantes, Agenda, Médecins
      case 'NURSE':
        return [
          {
            title: 'ESPACE SOINS',
            items: [
              {
                label: 'Tableau de bord',
                href: '/dashboard',
                icon: LayoutDashboard,
              },
            ],
          },
          {
            title: 'SOINS & PATIENTS',
            items: [
              {
                key: 'patients',
                label: 'Patients & Constantes',
                icon: Users,
                href: '/patients',
                subItems: [
                  { label: 'Tous les patients', href: '/patients' },
                  { label: 'Ajouter un patient', href: '/patients/new', icon: PlusCircle },
                ],
              },
              {
                label: 'Rendez-vous',
                icon: Calendar,
                href: '/appointments',
              },
              {
                label: 'Médecins',
                icon: UserCheck,
                href: '/doctors',
              },
            ],
          },
        ];

      // 5. COMPTE COMPTABLE : Factures, Caisse & Recettes, Rapports
      case 'ACCOUNTANT':
        return [
          {
            title: 'ESPACE FINANCES',
            items: [
              {
                label: 'Tableau de bord',
                href: '/dashboard',
                icon: LayoutDashboard,
              },
            ],
          },
          {
            title: 'FINANCE & FACTURATION',
            items: [
              {
                key: 'invoices',
                label: 'Facturation',
                icon: CreditCard,
                href: '/invoices',
                subItems: [
                  { label: 'Factures patients', href: '/invoices' },
                  { label: 'Nouvelle facture', href: '/invoices/new', icon: PlusCircle },
                  { label: 'Paiements & Caisse', href: '/payments' },
                ],
              },
              {
                label: 'Rapports & Stats',
                href: '/reports',
                icon: BarChart3,
              },
            ],
          },
        ];

      // 6. COMPTE ADMINISTRATION (SUPER_ADMIN, CLINIC_ADMIN) : Accès complet
      case 'SUPER_ADMIN':
      case 'CLINIC_ADMIN':
      default:
        return [
          {
            title: 'TABLEAU DE BORD',
            items: [
              {
                label: 'Dashboard Global',
                href: '/dashboard',
                icon: LayoutDashboard,
                badge: 'Admin',
              },
            ],
          },
          {
            title: 'GESTION MÉDICALE',
            items: [
              {
                key: 'patients',
                label: 'Patients',
                icon: Users,
                href: '/patients',
                subItems: [
                  { label: 'Tous les patients', href: '/patients' },
                  { label: 'Ajouter un patient', href: '/patients/new', icon: PlusCircle },
                ],
              },
              {
                key: 'appointments',
                label: 'Rendez-vous',
                icon: Calendar,
                href: '/appointments',
                subItems: [
                  { label: 'Calendrier des RDV', href: '/appointments' },
                  { label: 'Nouveau rendez-vous', href: '/appointments/new', icon: PlusCircle },
                ],
              },
              {
                key: 'consultations',
                label: 'Consultations',
                icon: Stethoscope,
                href: '/consultations',
                subItems: [
                  { label: 'Toutes les consultations', href: '/consultations' },
                  { label: 'Nouvelle consultation', href: '/consultations/new', icon: PlusCircle },
                ],
              },
              {
                label: 'Médecins',
                href: '/doctors',
                icon: UserCheck,
              },
              {
                label: 'Ordonnances',
                href: '/prescriptions',
                icon: FileText,
              },
            ],
          },
          {
            title: 'PHARMACIE & STOCKS',
            items: [
              {
                key: 'pharmacy',
                label: 'Pharmacie',
                icon: Pill,
                href: '/pharmacy',
                subItems: [
                  { label: 'Vue d’ensemble', href: '/pharmacy' },
                  { label: 'Catalogue Médicaments', href: '/pharmacy/medicines' },
                  { label: 'Stocks & Mouvements', href: '/pharmacy/stock' },
                  { label: 'Caisse Ventes (POS)', href: '/pharmacy/sales' },
                  { label: 'Fournisseurs', href: '/pharmacy/suppliers' },
                ],
              },
            ],
          },
          {
            title: 'FINANCE & FACTURATION',
            items: [
              {
                key: 'invoices',
                label: 'Facturation',
                icon: CreditCard,
                href: '/invoices',
                subItems: [
                  { label: 'Factures patients', href: '/invoices' },
                  { label: 'Nouvelle facture', href: '/invoices/new', icon: PlusCircle },
                  { label: 'Paiements & Caisse', href: '/payments' },
                ],
              },
            ],
          },
          {
            title: 'ADMINISTRATION',
            items: [
              {
                label: 'Rapports & Stats',
                href: '/reports',
                icon: BarChart3,
              },
              {
                label: 'Utilisateurs & Rôles',
                href: '/users',
                icon: ShieldCheck,
              },
              {
                label: 'Paramètres Clinique',
                href: '/settings/clinic',
                icon: Settings,
              },
            ],
          },
        ];
    }
  }, [user.role]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-white">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-sky-800 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <span className="text-lg">M</span>
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-lg tracking-wide">
                MY <span className="text-blue-600">CLINIQUE</span>
              </span>
              <p
                className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none truncate max-w-[155px]"
                title={clinicName || user.clinicName || 'Clinique Médicale'}
              >
                {clinicName || user.clinicName || 'Clinique Médicale'}
              </p>
            </div>
          </Link>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>

              {section.items.map((item: any, iIdx) => {
                const Icon = item.icon;
                const isSub = Boolean(item.subItems);
                const isSubOpen = openMenus[item.key || ''];
                const isActive = item.href ? pathname === item.href : false;

                if (!isSub) {
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                // Submenu Parent
                return (
                  <div key={iIdx} className="space-y-1">
                    <button
                      onClick={() => toggleSubmenu(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pathname.startsWith(item.href)
                          ? 'text-blue-600 font-semibold bg-blue-50/50'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${pathname.startsWith(item.href) ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isSubOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {/* Submenu Children */}
                    {isSubOpen && (
                      <div className="pl-9 pr-2 space-y-1 py-1">
                        {item.subItems.map((sub: any, subIdx: number) => {
                          const isSubActive = pathname === sub.href;
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={subIdx}
                              href={sub.href}
                              onClick={onCloseMobile}
                              className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              {SubIcon && <SubIcon className="w-3 h-3" />}
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
            <Link href="/profile" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <span className="inline-block text-[10px] text-blue-700 font-semibold truncate">
                  {roleInfo.label}
                </span>
              </div>
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Déconnexion"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
