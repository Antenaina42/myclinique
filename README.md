# MY CLINIQUE — La gestion intelligente de votre clinique

![MY CLINIQUE Logo](public/logo/my-clinique-logo.svg)

> **MY CLINIQUE** est une application web SaaS complète, moderne et sécurisée conçue pour centraliser et digitaliser l'intégralité des opérations d'un centre médical ou d'une clinique hospitalière : dossiers médicaux, consultations, ordonnances électroniques sécurisées par QR code, pharmacie avec caisse POS et gestion de stock en temps réel, facturation, journal de caisse, statistiques avancées et administration RBAC.

---

## 🌟 Fonctionnalités Clés

### 🏥 1. Dossier Patient & Antécédents Médicaux
- **Identité patient complète** : N° de dossier unique auto-généré (`PAT-YYYY-XXXXX`), photo, groupe sanguin, contacts d'urgence, CIN.
- **Dossier médical structuré** : Allergies, antécédents médicaux/chirurgicaux/familiaux, maladies chroniques, habitudes de vie (tabac, alcool, sédentarité).
- **Vue 360° du patient** en 6 onglets : Informations, Antécédents, Historique des consultations, Ordonnances délivrées, Factures associées et Documents.

### 🩺 2. Consultations & Constantes Vitales
- **Examen clinique complet** : Motif de visite, anamnèse, examen physique, diagnostic principal (CIM-10), plan de traitement, notes confidentielles.
- **Prise de constantes vitales** : Température, Tension artérielle (systolique / diastolique), Fréquence cardiaque, SpO2, Poids, Taille.
- **Calculateur automatique d'IMC** : Calcul en temps réel avec interprétation de l'indice de masse corporelle (Normal, Surpoids, Obésité, etc.).
- **Passerelle directe vers l'ordonnance** préremplie avec le médecin et le patient.

### 📄 3. Ordonnances Médicales Sécurisées & PDF
- **Prescription multi-lignes** : Médicament, dosage, forme (comprimé, sirop, injectable), posologie, durée de traitement et recommandations spéciales.
- **Génération PDF vectorielle native** (jsPDF + AutoTable) prête à l'impression :
  - En-tête officiel de la clinique avec logo, coordonnées et mentions légales.
  - Identification précise du praticien avec son numéro d'ordre national.
  - **QR Code unique sécurisé** pour vérification d'authenticité par la pharmacie ou les autorités sanitaires.
  - Tampon et signature numérique du médecin.

### 💊 4. Pharmacie & Caisse Ventes (POS)
- **Catalogue de médicaments** : DCI (nom générique), dosage, forme galénique, prix unitaire en Ariary (`Ar`), seuil d'alerte de stock minimal.
- **Gestion des mouvements de stock** : Entrées fournisseurs avec numéros de lots et dates de péremption, sorties pour avaries ou consommations internes.
- **Point de Vente (POS / Caisse Pharmacie)** :
  - Recherche rapide de médicaments avec vérification en direct des stocks disponibles.
  - Panier interactif avec calcul instantané du total, sélection du mode de règlement (Espèces, Mobile Money MVola/Orange Money/Airtel Money, Carte Bancaire).
  - Calculateur de monnaie à rendre et ticket de caisse imprimable avec numéro de vente unique (`POS-YYYYMMDD-XXXX`).
  - Déduction atomique et transactionnelle du stock en base de données MySQL.

### 💳 5. Facturation & Journal de Caisse
- **Facturation patient détaillée** : Prestations de soins, actes médicaux, hospitalisation, médicaments avec statut de paiement (Impayée, Partielle, Payée, Annulée).
- **Enregistrement des paiements échelonnés** : Règlements partiels avec calcul dynamique du solde restant dû.
- **Export PDF professionnel** de chaque facture avec détail des règlements et cachet officiel.
- **Journal de caisse** : Suivi chronologique de toutes les entrées et sorties de trésorerie avec solde en temps réel.

### 📅 6. Agenda & Rendez-vous
- Calendrier interactif des consultations programmées par médecin.
- Gestion des statuts de rendez-vous : En attente, Confirmé, En cours, Terminé, Annulé.
- Création rapide de rendez-vous avec filtrage par médecin traitant et spécialité.

### 📊 7. Rapports & Tableaux de Bord Analytiques
- Indicateurs clés (KPI) en temps réel : Patients enregistrés, Consultations du mois, Recettes encaissées, Médicaments en alerte de rupture.
- Graphiques dynamiques Recharts : Évolution financière mensuelle, Répartition des consultations par spécialité médicale, Distribution des tranches d'âge des patients.
- Export des données au format CSV.

### 🛡️ 8. Administration, Sécurité & RBAC
- **Contrôle d'accès basé sur les rôles (RBAC)** :
  - **Super Admin** : Contrôle absolu sur l'ensemble de la plateforme et des configurations.
  - **Clinic Admin** : Administration de l'établissement, utilisateurs et paramètres légaux.
  - **Médecin** : Consultations, dossiers médicaux, prescriptions, agenda personnel.
  - **Infirmier** : Constantes vitales, assistance aux soins, consultations infirmières.
  - **Pharmacien** : Gestion du catalogue, approvisionnements, stocks et caisse POS.
  - **Réceptionniste** : Accueil des patients, création de dossiers, planification des RDV.
  - **Comptable** : Factures, encaissements, journal de caisse et rapports financiers.
- **Journal d'Audit complet** : Traçabilité inviolable de toutes les actions sensibles (création, modification, suppression, encaissements, connexions).
- **Paramètres de la clinique** : Personnalisation de l'identité, adresse, devises (Ariary `Ar` par défaut), mentions légales et durée des consultations.

### 💬 9. Messagerie Instantanée Interne (Style Messenger)
- **Bulle flottante & volet de discussion escamotable** en bas à droite sur toutes les pages de l'application.
- **Communication temps réel entre utilisateurs** : Médecins, infirmiers, pharmaciens, accueil et administration.
- **Badge dynamique des messages non lus**, accusés d'envoi et de lecture, recherche rapide de collaborateurs.
- **Persistance MySQL** : Modèle relationnel `ChatMessage` avec horodatage précis et notifications intégrées.

---

## 💻 Architecture Technique

| Composant | Technologie |
| :--- | :--- |
| **Framework Web** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Interface Utilisateur** | [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Langage** | [TypeScript 5](https://www.typescriptlang.org/) (Typage strict de bout en bout) |
| **Moteur de Données** | [MySQL 9.1 / 8.0+](https://www.mysql.com/) via WampServer |
| **ORM & Migrations** | [Prisma 5.22](https://www.prisma.io/) |
| **Authentification** | Sessions JWT chiffrées ([jose](https://github.com/panva/jose)), Hachage [bcryptjs](https://github.com/dcodeIO/bcrypt.js), Cookies HttpOnly |
| **Visualisations** | [Recharts](https://recharts.org/) |
| **Génération PDF** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) + [qrcode](https://github.com/soldair/node-qrcode) |

---

## 🚀 Prérequis & Installation

### Prérequis
1. **Node.js** version 18 ou supérieure (recommandé v20+ ou v24+).
2. **WampServer** avec MySQL démarré sur le port `3306` (ou tout serveur MySQL 8/9).

### 1. Cloner ou ouvrir le projet
```bash
cd c:\wamp64\www\myclinique
```

### 2. Configurer les variables d'environnement
Créez un fichier `.env` à la racine (ou vérifiez le fichier existant) :
```env
# Connexion MySQL (WampServer MySQL sur le port 3306)
DATABASE_URL="mysql://root:root@localhost:3306/myclinique_db"

# Clé secrète JWT pour les sessions utilisateurs
JWT_SECRET="myclinique_jwt_secret_key_2026_super_secure_987654321_hospital"

# Environnement
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="MY CLINIQUE"
NEXT_PUBLIC_DEFAULT_CURRENCY="Ar"
```

> **Note WampServer** : Si votre utilisateur MySQL `root` n'a pas de mot de passe, utilisez `mysql://root:@localhost:3306/myclinique_db`.

### 3. Installer les dépendances
```bash
npm install
```

### 4. Créer la base de données et appliquer le schéma Prisma
```bash
# Générer le client Prisma et synchroniser les 30 tables relationnelles
npx prisma db push
```

### 5. Peupler la base avec le jeu de données réaliste
```bash
# Exécute le script de seed (Clinique, Rôles, Spécialités, Médecins, Médicaments, 20 Patients, Consultations, Factures, Stocks)
npx ts-node prisma/seed.ts
```

### 6. Lancer le serveur de développement
```bash
npm run dev
```
L'application est disponible immédiatement sur : **http://localhost:3000**

---

## 🔑 Comptes de Démonstration

Sur la page de connexion (`/login`), un panneau **Connexion Rapide Démo** permet de basculer instantanément entre les différents rôles en 1 clic :

| Rôle | Email | Mot de passe | Description des accès |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@myclinique.com` | `password123` | Accès complet, gestion des utilisateurs, paramètres clinique |
| **Médecin Chef** | `dr.dupont@myclinique.com` | `password123` | Dossiers patients, consultations, ordonnances PDF, agenda |
| **Pharmacien** | `pharmacien@myclinique.com` | `password123` | Gestion catalogue, mouvements stock, caisse POS |
| **Réceptionniste** | `reception@myclinique.com` | `password123` | Accueil patients, nouveaux dossiers, prise de rendez-vous |
| **Comptable** | `comptable@myclinique.com` | `password123` | Factures, règlements, journal de caisse, rapports |

---

## 📂 Structure du Projet

```
myclinique/
├── prisma/
│   ├── schema.prisma          # Schéma de 30 tables relationnelles MySQL
│   └── seed.ts                # Jeu de données complet et réaliste
├── public/
│   └── logo/                  # Logos SVG vectoriels My Clinique
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/               # Routes API REST (CRUD, PDF, POS, Auth)
│   │   │   ├── appointments/  # Prise & gestion des rendez-vous
│   │   │   ├── auth/          # Login, logout, session
│   │   │   ├── consultations/ # Enregistrement examen & constantes
│   │   │   ├── doctors/       # Praticiens & spécialités
│   │   │   ├── invoices/      # Factures & règlements
│   │   │   ├── medicines/     # Médicaments & alertes stock
│   │   │   ├── patients/      # CRUD Patients & dossier médical
│   │   │   ├── pharmacy/      # Ventes POS & mouvements de stock
│   │   │   ├── prescriptions/ # Ordonnances & génération PDF
│   │   │   ├── profile/       # Profil utilisateur & mot de passe
│   │   │   ├── search/        # Recherche globale multi-entités
│   │   │   ├── settings/      # Configuration de la clinique
│   │   │   ├── stats/         # Données pour graphiques Recharts
│   │   │   └── users/         # Gestion des utilisateurs & rôles
│   │   ├── appointments/      # Pages Calendrier & Prise de RDV
│   │   ├── consultations/     # Pages Examen clinique & Constantes
│   │   ├── dashboard/         # Tableau de bord principal avec KPI
│   │   ├── doctors/           # Annuaire du corps médical
│   │   ├── invoices/          # Facturation & paiements patients
│   │   ├── login/             # Page d'authentification avec démo 1-clic
│   │   ├── patients/          # Répertoire, création & dossier médical 360°
│   │   ├── payments/          # Journal de caisse & trésorerie
│   │   ├── pharmacy/          # Pharmacie : catalogue, stocks, POS, fournisseurs
│   │   ├── prescriptions/     # Ordonnances & téléchargement PDF
│   │   ├── profile/           # Profil personnel, sécurité & journal d'audit
│   │   ├── reports/           # Rapports démographiques, cliniques & financiers
│   │   ├── settings/          # Paramètres généraux de la clinique
│   │   └── users/             # Annuaire du personnel & gestion RBAC
│   ├── components/
│   │   ├── layout/            # Sidebar, Topbar, DashboardLayout, Modals
│   │   └── ui/                # Composants réutilisables (Card, Badge, Modal)
│   ├── lib/
│   │   ├── audit.ts           # Enregistrement du journal d'audit
│   │   ├── auth.ts            # Chiffrement JWT & hachage bcrypt
│   │   ├── formatters.ts      # Formatage Ariary (Ar), dates, calcul IMC
│   │   ├── pdf.ts             # Moteur de génération PDF d'ordonnances et factures
│   │   └── prisma.ts          # Client singleton Prisma ORM
│   └── types/                 # Interfaces TypeScript globales
├── tailwind.config.ts         # Configuration du design système médical
└── tsconfig.json              # Configuration TypeScript stricte
```

---

## 🛡️ Sécurité & Bonnes Pratiques Médicales
1. **Confidentialité des Données de Santé** : Hachage fort des mots de passe en `bcrypt`, validation serveur stricte sur toutes les routes API.
2. **Sessions Sécurisées** : Tokens signés via JWT algorithme HS256 stockés dans des cookies `HttpOnly`, `SameSite=Lax`.
3. **Traçabilité & Déontologie** : Chaque ordonnance et diagnostic est lié au praticien responsable avec son numéro d'ordre et archivé de façon inaltérable.
4. **Intégrité Transactionnelle** : Les mouvements de stock et ventes en caisse sont exécutés dans des transactions atomiques MySQL `$transaction` pour éviter toute incohérence de stock.

---

## 📄 Licence
Ce projet est développé dans le cadre de la solution médicale professionnelle **MY CLINIQUE**. Tous droits réservés © 2026.
