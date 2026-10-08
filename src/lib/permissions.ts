import { RoleType } from '@/types';

/**
 * Matrice des droits d'accès par rôle pour chaque module de l'application
 */
export const MODULE_PERMISSIONS: Record<string, RoleType[]> = {
  // Module Pharmacie : uniquement Pharmacien et Administrateurs
  '/pharmacy': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'PHARMACIST'],

  // Module Consultations : Médecins et Administrateurs
  '/consultations': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR'],

  // Module Agenda / Rendez-vous : Accueil/Réceptionniste, Médecins, Infirmiers et Administrateurs
  '/appointments': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],

  // Module Dossiers Patients : Accueil (création/identité), Médecins, Infirmiers et Administrateurs
  '/patients': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],

  // Module Ordonnances : Médecins (prescription), Pharmaciens (délivrance) et Administrateurs
  '/prescriptions': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'PHARMACIST'],

  // Module Médecins : Accueil (disponibilités), Médecins (annuaire), Infirmiers et Administrateurs
  '/doctors': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],

  // Module Factures & Caisse : Comptables et Administrateurs
  '/invoices': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'ACCOUNTANT'],
  '/payments': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'ACCOUNTANT'],

  // Module Rapports & Statistiques : Comptables et Administrateurs
  '/reports': ['SUPER_ADMIN', 'CLINIC_ADMIN', 'ACCOUNTANT'],

  // Module Gestion Utilisateurs & Rôles : Super Admin et Admin Clinique
  '/users': ['SUPER_ADMIN', 'CLINIC_ADMIN'],

  // Module Paramètres Clinique : Super Admin et Admin Clinique
  '/settings': ['SUPER_ADMIN', 'CLINIC_ADMIN'],
};

/**
 * Vérifie si un rôle donné a l'autorisation d'accéder à un chemin URL
 */
export function hasModuleAccess(role: RoleType | undefined | null, pathname: string): boolean {
  if (!role) return false;
  if (role === 'SUPER_ADMIN') return true;

  // Trouver la règle correspondante la plus spécifique
  const matchingKey = Object.keys(MODULE_PERMISSIONS).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!matchingKey) {
    // Les routes non restreintes explicitement (ex: /dashboard, /profile) sont accessibles à tout utilisateur authentifié
    return true;
  }

  const allowedRoles = MODULE_PERMISSIONS[matchingKey] || [];
  return allowedRoles.includes(role);
}

/**
 * Libellé lisible pour chaque rôle
 */
export function getRoleBadgeLabel(role: RoleType | undefined | null): { label: string; color: string; description: string } {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        label: 'Super Admin',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'Administration globale & configurations système',
      };
    case 'CLINIC_ADMIN':
      return {
        label: 'Admin Clinique',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Gestion globale de l’établissement, finances et utilisateurs',
      };
    case 'DOCTOR':
      return {
        label: 'Médecin Praticien',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        description: 'Consultations, dossiers médicaux, prescriptions & agenda',
      };
    case 'PHARMACIST':
      return {
        label: 'Pharmacien',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        description: 'Gestion de la pharmacie, stocks, catalogue & caisse POS',
      };
    case 'RECEPTIONIST':
      return {
        label: 'Accueil & Réception',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        description: 'Accueil des patients, gestion des rendez-vous & admissions',
      };
    case 'NURSE':
      return {
        label: 'Infirmier(ère)',
        color: 'bg-teal-100 text-teal-800 border-teal-200',
        description: 'Prise des constantes, soins & assistance médicale',
      };
    case 'ACCOUNTANT':
      return {
        label: 'Comptable',
        color: 'bg-rose-100 text-rose-800 border-rose-200',
        description: 'Facturation, encaissements & rapports financiers',
      };
    default:
      return {
        label: 'Utilisateur',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        description: 'Accès standard',
      };
  }
}
