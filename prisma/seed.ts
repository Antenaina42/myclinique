import { PrismaClient, RoleType, Gender, AppointmentStatus, ConsultationStatus, PrescriptionStatus, InvoiceStatus, PaymentMethod, CashTransactionType, NotificationType, AuditAction, DocumentCategory, StockExitReason, InvoiceItemType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed pour MY CLINIQUE...');

  // Nettoyage préalable pour garantir une ré-exécution idempotente
  await prisma.cashTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.pharmacySaleItem.deleteMany();
  await prisma.pharmacySale.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.vitalSign.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patientDocument.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.stockExit.deleteMany();
  await prisma.stockEntry.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();

  // 1. Clinique Principale
  const clinic = await prisma.clinic.upsert({
    where: { slug: 'saint-luc' },
    update: {},
    create: {
      name: 'Clinique Médicale Saint-Luc',
      slug: 'saint-luc',
      slogan: 'La gestion intelligente de votre clinique',
      logoUrl: '/logo/my-clinique-logo.svg',
      address: 'Lot IVG 35 Rue Pasteur, Antananarivo 101, Madagascar',
      phone: '+261 20 22 123 45',
      email: 'contact@myclinique.mg',
      website: 'https://myclinique.mg',
      taxId: 'NIF: 3000123456 / STAT: 85111 11 2015 0 00123',
      currency: 'Ar',
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'Indian/Antananarivo',
    },
  });
  console.log('✅ Clinique créée :', clinic.name);

  // 2. Rôles RBAC
  const rolesData = [
    { name: RoleType.SUPER_ADMIN, displayName: 'Super Administrateur', description: 'Accès global absolu à tous les modules et configurations' },
    { name: RoleType.CLINIC_ADMIN, displayName: 'Administrateur Clinique', description: 'Gestion globale de l’établissement, utilisateurs et finances' },
    { name: RoleType.DOCTOR, displayName: 'Médecin Praticien', description: 'Consultations, dossiers médicaux, prescriptions, agenda' },
    { name: RoleType.NURSE, displayName: 'Infirmier(ère)', description: 'Prise des constantes, accueil médical, assistance soins' },
    { name: RoleType.PHARMACIST, displayName: 'Pharmacien', description: 'Gestion de la pharmacie, stocks, ventes POS, réapprovisionnement' },
    { name: RoleType.RECEPTIONIST, displayName: 'Réceptionniste', description: 'Accueil des patients, gestion des rendez-vous et file d’attente' },
    { name: RoleType.ACCOUNTANT, displayName: 'Comptable', description: 'Facturation, encaissements, impayés et journal de caisse' },
  ];

  const rolesMap: Record<string, string> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: r,
    });
    rolesMap[r.name] = role.id;
  }
  console.log('✅ Rôles RBAC créés');

  // Mot de passe par défaut : password123
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Spécialités Médicales
  const specialtiesData = [
    { name: 'Médecine Générale', description: 'Soins primaires et suivi global des patients' },
    { name: 'Cardiologie', description: 'Maladies du cœur et du système cardiovasculaire' },
    { name: 'Pédiatrie', description: 'Santé et développement des enfants et nourrissons' },
    { name: 'Gynécologie-Obstétrique', description: 'Santé féminine, suivi de grossesse et accouchements' },
    { name: 'Dermatologie', description: 'Affections de la peau, des muqueuses et des phanères' },
    { name: 'Ophtalmologie', description: 'Soins et chirurgie des yeux et de la vision' },
  ];

  const specialtyMap: Record<string, string> = {};
  for (const s of specialtiesData) {
    const spec = await prisma.specialty.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    specialtyMap[s.name] = spec.id;
  }
  console.log('✅ Spécialités créées');

  // 4. Utilisateurs de test pour chaque profil
  // Super Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@myclinique.com' },
    update: {},
    create: {
      email: 'admin@myclinique.com',
      passwordHash,
      firstName: 'Alexandre',
      lastName: 'Dumas',
      phone: '+261 34 00 111 00',
      clinicId: clinic.id,
      roleId: rolesMap[RoleType.SUPER_ADMIN],
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Clinique Admin
  await prisma.user.upsert({
    where: { email: 'admin.clinique@myclinique.com' },
    update: {},
    create: {
      email: 'admin.clinique@myclinique.com',
      passwordHash,
      firstName: 'Béatrice',
      lastName: 'Andrianina',
      phone: '+261 34 00 111 01',
      clinicId: clinic.id,
      roleId: rolesMap[RoleType.CLINIC_ADMIN],
      isActive: true,
    },
  });

  // Médecins
  const doctorsData = [
    {
      email: 'dr.dupont@myclinique.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+261 34 02 444 01',
      specialty: 'Médecine Générale',
      license: 'ONM-MG-10452',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      bio: 'Praticien hospitalier avec 15 ans d’expérience en diagnostic clinique et médecine interne.',
    },
    {
      email: 'dr.rakoto@myclinique.com',
      firstName: 'Hery',
      lastName: 'Rakoto',
      phone: '+261 34 02 444 02',
      specialty: 'Cardiologie',
      license: 'ONM-CARDIO-10894',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      bio: 'Spécialiste des pathologies coronariennes, hypertension artérielle et échocardiographie.',
    },
    {
      email: 'dr.andry@myclinique.com',
      firstName: 'Aina',
      lastName: 'Andry',
      phone: '+261 34 02 444 03',
      specialty: 'Pédiatrie',
      license: 'ONM-PED-11203',
      avatar: 'https://images.unsplash.com/photo-1594824813689-f52f36d4f9b8?w=150&auto=format&fit=crop&q=80',
      bio: 'Pédiatre passionnée, prise en charge des nourrissons, vaccinations et néonatalogie.',
    },
    {
      email: 'dr.claire@myclinique.com',
      firstName: 'Claire',
      lastName: 'Ramanantsoa',
      phone: '+261 34 02 444 04',
      specialty: 'Gynécologie-Obstétrique',
      license: 'ONM-GYN-11450',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      bio: 'Suivi obstétrical, échographies de grossesse et prévention gynécologique.',
    },
    {
      email: 'dr.michel@myclinique.com',
      firstName: 'Michel',
      lastName: 'Razafy',
      phone: '+261 34 02 444 05',
      specialty: 'Dermatologie',
      license: 'ONM-DERM-12019',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
      bio: 'Dermatologie générale, dépistage des mélanomes et dermatologie pédiatrique.',
    },
  ];

  const createdDoctors: any[] = [];
  for (const doc of doctorsData) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        email: doc.email,
        passwordHash,
        firstName: doc.firstName,
        lastName: doc.lastName,
        phone: doc.phone,
        avatar: doc.avatar,
        clinicId: clinic.id,
        roleId: rolesMap[RoleType.DOCTOR],
        isActive: true,
      },
    });

    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        clinicId: clinic.id,
        licenseNumber: doc.license,
        specialtyId: specialtyMap[doc.specialty],
        phone: doc.phone,
        bio: doc.bio,
        workingHours: 'Lun - Ven: 08h00 - 16h30',
      },
    });
    createdDoctors.push({ ...doctor, user });
  }
  console.log('✅ 5 Médecins créés avec profils et spécialités');

  // Autres profils
  await prisma.user.upsert({
    where: { email: 'infirmier@myclinique.com' },
    update: {},
    create: {
      email: 'infirmier@myclinique.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Rasoa',
      phone: '+261 34 03 555 01',
      clinicId: clinic.id,
      roleId: rolesMap[RoleType.NURSE],
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.upsert({
    where: { email: 'pharmacien@myclinique.com' },
    update: {},
    create: {
      email: 'pharmacien@myclinique.com',
      passwordHash,
      firstName: 'Tahina',
      lastName: 'Randria',
      phone: '+261 34 03 555 02',
      clinicId: clinic.id,
      roleId: rolesMap[RoleType.PHARMACIST],
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.upsert({
    where: { email: 'reception@myclinique.com' },
    update: {},
    create: {
      email: 'reception@myclinique.com',
      passwordHash,
      firstName: 'Fanja',
      lastName: 'Rabary',
      phone: '+261 34 03 555 03',
      clinicId: clinic.id,
      roleId: rolesMap[RoleType.RECEPTIONIST],
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.upsert({
    where: { email: 'comptable@myclinique.com' },
    update: {},
    create: {
      email: 'comptable@myclinique.com',
      passwordHash,
      firstName: 'Mamy',
      lastName: 'Ralison',
      phone: '+261 34 03 555 04',
      clinicId: clinic.id,
      roleId: rolesMap[RoleType.ACCOUNTANT],
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });
  console.log('✅ Utilisateurs Infirmière, Pharmacien, Réceptionniste et Comptable créés');

  // 5. Fournisseurs Pharmaceutiques
  const suppliersData = [
    { name: 'SALAMA Madagascar', contactPerson: 'Mme Voahangy', phone: '+261 20 22 250 11', email: 'salama@salama.mg', address: 'Anosivavaka, Antananarivo' },
    { name: 'Pharmapro Distribution', contactPerson: 'M. Eric Rajaona', phone: '+261 20 22 345 67', email: 'commandes@pharmapro.mg', address: 'Ankorondrano, Antananarivo' },
    { name: 'Sodipharm Madagascar', contactPerson: 'Dr. Lalao R.', phone: '+261 20 22 678 90', email: 'contact@sodipharm.mg', address: 'Tanjombato, Antananarivo' },
    { name: 'Laborex Océan Indien', contactPerson: 'M. Jean-Paul', phone: '+261 20 22 411 22', email: 'laborex@laborex-oi.com', address: 'Andraharo, Antananarivo' },
    { name: 'MediSupply International', contactPerson: 'Mme Carole', phone: '+261 20 22 899 00', email: 'info@medisupply.mg', address: 'Ivato, Antananarivo' },
  ];

  const createdSuppliers: any[] = [];
  for (const sup of suppliersData) {
    const s = await prisma.supplier.create({
      data: { ...sup, clinicId: clinic.id },
    });
    createdSuppliers.push(s);
  }
  console.log('✅ 5 Fournisseurs pharmaceutiques créés');

  // 6. Catégories de Médicaments
  const categoriesData = [
    { name: 'Antalgiques & Antipyrétiques', description: 'Contre la douleur et la fièvre' },
    { name: 'Antibiotiques', description: 'Traitement des infections bactériennes' },
    { name: 'Anti-inflammatoires', description: 'AINS et corticoïdes' },
    { name: 'Cardiologie & Hypertension', description: 'Régulation de la tension artérielle et rythme cardiaque' },
    { name: 'Gastro-entérologie', description: 'Estomac, digestion et transit intestinal' },
    { name: 'Vitamines & Compléments', description: 'Renforcement immunitaire et toniques' },
    { name: 'Dermatologie', description: 'Pommade, crèmes et antiseptiques cutanés' },
    { name: 'Antipaludéens', description: 'Traitement et prévention du paludisme' },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.medicineCategory.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    catMap[c.name] = cat.id;
  }
  console.log('✅ Catégories de médicaments créées');

  // 7. 30 Médicaments réalistes avec prix en Ariary (Ar)
  const medicinesData = [
    { name: 'Doliprane 1000 mg', genericName: 'Paracétamol', category: 'Antalgiques & Antipyrétiques', form: 'Comprimé', dosage: '1000 mg', purchasePrice: 3500, sellingPrice: 5000, currentStock: 140, minStockLevel: 25, expiryDate: new Date('2027-08-30'), location: 'Rayon A1' },
    { name: 'Efferalgan 500 mg', genericName: 'Paracétamol', category: 'Antalgiques & Antipyrétiques', form: 'Comprimé effervescent', dosage: '500 mg', purchasePrice: 4000, sellingPrice: 6000, currentStock: 80, minStockLevel: 20, expiryDate: new Date('2027-04-15'), location: 'Rayon A1' },
    { name: 'Tramadol 50 mg', genericName: 'Tramadol chlorhydrate', category: 'Antalgiques & Antipyrétiques', form: 'Gélule', dosage: '50 mg', purchasePrice: 12000, sellingPrice: 16500, currentStock: 35, minStockLevel: 15, expiryDate: new Date('2026-11-20'), location: 'Armoire sécurisée B' },
    { name: 'Amoxicilline Biogaran 500 mg', genericName: 'Amoxicilline', category: 'Antibiotiques', form: 'Gélule', dosage: '500 mg', purchasePrice: 8500, sellingPrice: 12500, currentStock: 65, minStockLevel: 25, expiryDate: new Date('2027-01-10'), location: 'Rayon B2' },
    { name: 'Augmentin 1 g / 125 mg', genericName: 'Amoxicilline + Acide Clavulanique', category: 'Antibiotiques', form: 'Comprimé pelliculé', dosage: '1 g', purchasePrice: 22000, sellingPrice: 32000, currentStock: 8, minStockLevel: 15, expiryDate: new Date('2026-12-05'), location: 'Rayon B2' }, // ALERTE STOCK FAIBLE
    { name: 'Azithromycine 500 mg', genericName: 'Azithromycine', category: 'Antibiotiques', form: 'Comprimé', dosage: '500 mg', purchasePrice: 15000, sellingPrice: 22000, currentStock: 4, minStockLevel: 10, expiryDate: new Date('2026-10-15'), location: 'Rayon B3' }, // ALERTE STOCK FAIBLE & EXPIRATION PROCHE
    { name: 'Ciprofloxacine 500 mg', genericName: 'Ciprofloxacine', category: 'Antibiotiques', form: 'Comprimé', dosage: '500 mg', purchasePrice: 9000, sellingPrice: 14000, currentStock: 42, minStockLevel: 15, expiryDate: new Date('2027-06-25'), location: 'Rayon B3' },
    { name: 'Ibuprofène 400 mg', genericName: 'Ibuprofène', category: 'Anti-inflammatoires', form: 'Comprimé', dosage: '400 mg', purchasePrice: 4500, sellingPrice: 7000, currentStock: 110, minStockLevel: 30, expiryDate: new Date('2027-09-18'), location: 'Rayon C1' },
    { name: 'Voltarène 75 mg', genericName: 'Diclofénac sodique', category: 'Anti-inflammatoires', form: 'Comprimé enrobé', dosage: '75 mg', purchasePrice: 8000, sellingPrice: 12000, currentStock: 50, minStockLevel: 20, expiryDate: new Date('2027-03-30'), location: 'Rayon C1' },
    { name: 'Solupred 20 mg', genericName: 'Prednisolone', category: 'Anti-inflammatoires', form: 'Comprimé orodispersible', dosage: '20 mg', purchasePrice: 14000, sellingPrice: 20000, currentStock: 38, minStockLevel: 15, expiryDate: new Date('2027-05-12'), location: 'Rayon C2' },
    { name: 'Amlodipine 5 mg', genericName: 'Bésylate d’amlodipine', category: 'Cardiologie & Hypertension', form: 'Gélule', dosage: '5 mg', purchasePrice: 11000, sellingPrice: 16000, currentStock: 55, minStockLevel: 20, expiryDate: new Date('2027-11-01'), location: 'Rayon D1' },
    { name: 'Co-Aprovel 150/12.5 mg', genericName: 'Irbésartan + Hydrochlorothiazide', category: 'Cardiologie & Hypertension', form: 'Comprimé', dosage: '150 mg', purchasePrice: 28000, sellingPrice: 39000, currentStock: 25, minStockLevel: 10, expiryDate: new Date('2027-07-20'), location: 'Rayon D1' },
    { name: 'Kardégic 75 mg', genericName: 'Acétylsalicylate de lysine', category: 'Cardiologie & Hypertension', form: 'Poudre pour solution', dosage: '75 mg', purchasePrice: 13000, sellingPrice: 18500, currentStock: 60, minStockLevel: 20, expiryDate: new Date('2028-01-10'), location: 'Rayon D2' },
    { name: 'Tahor 20 mg', genericName: 'Atorvastatine', category: 'Cardiologie & Hypertension', form: 'Comprimé pelliculé', dosage: '20 mg', purchasePrice: 25000, sellingPrice: 35000, currentStock: 19, minStockLevel: 15, expiryDate: new Date('2027-02-14'), location: 'Rayon D2' },
    { name: 'Inexium 20 mg', genericName: 'Esoméprazole', category: 'Gastro-entérologie', form: 'Gélule gastro-résistante', dosage: '20 mg', purchasePrice: 16000, sellingPrice: 23500, currentStock: 72, minStockLevel: 25, expiryDate: new Date('2027-10-10'), location: 'Rayon E1' },
    { name: 'Smecta 3 g', genericName: 'Diosmectite', category: 'Gastro-entérologie', form: 'Sachet suspension', dosage: '3 g', purchasePrice: 1800, sellingPrice: 2800, currentStock: 200, minStockLevel: 50, expiryDate: new Date('2028-05-15'), location: 'Rayon E2' },
    { name: 'Spasfon Lyoc 80 mg', genericName: 'Phloroglucinol', category: 'Gastro-entérologie', form: 'Lyophilisat oral', dosage: '80 mg', purchasePrice: 7500, sellingPrice: 11000, currentStock: 95, minStockLevel: 30, expiryDate: new Date('2027-09-01'), location: 'Rayon E2' },
    { name: 'Gaviscon Suspension', genericName: 'Alginate de sodium', category: 'Gastro-entérologie', form: 'Flacon 250 ml', dosage: '250 ml', purchasePrice: 14000, sellingPrice: 21000, currentStock: 5, minStockLevel: 15, expiryDate: new Date('2026-10-28'), location: 'Rayon E3' }, // ALERTE STOCK FAIBLE
    { name: 'Coartem 20/120', genericName: 'Artéméther + Luméfantrine', category: 'Antipaludéens', form: 'Comprimé', dosage: '20/120 mg', purchasePrice: 11000, sellingPrice: 16000, currentStock: 120, minStockLevel: 40, expiryDate: new Date('2027-12-31'), location: 'Rayon F1' },
    { name: 'Artésunate Injectable 60 mg', genericName: 'Artésunate', category: 'Antipaludéens', form: 'Flacon injectable', dosage: '60 mg', purchasePrice: 18000, sellingPrice: 26000, currentStock: 30, minStockLevel: 15, expiryDate: new Date('2027-06-15'), location: 'Rayon F1' },
    { name: 'Bétadine Dermique 10%', genericName: 'Povidone iodée', category: 'Dermatologie', form: 'Flacon 125 ml', dosage: '10%', purchasePrice: 8000, sellingPrice: 12000, currentStock: 45, minStockLevel: 20, expiryDate: new Date('2027-04-22'), location: 'Rayon G1' },
    { name: 'Fucidine 2%', genericName: 'Acide fusidique', category: 'Dermatologie', form: 'Tube crème 15 g', dosage: '2%', purchasePrice: 12500, sellingPrice: 18000, currentStock: 22, minStockLevel: 12, expiryDate: new Date('2027-03-10'), location: 'Rayon G2' },
    { name: 'Biafine Émulsion', genericName: 'Trolamine', category: 'Dermatologie', form: 'Tube 93 g', dosage: '0.67%', purchasePrice: 15000, sellingPrice: 22000, currentStock: 3, minStockLevel: 10, expiryDate: new Date('2026-10-01'), location: 'Rayon G2' }, // ALERTE STOCK FAIBLE & EXPIRATION PROCHE
    { name: 'Vitamine C 1000 mg', genericName: 'Acide ascorbique', category: 'Vitamines & Compléments', form: 'Tube effervescent', dosage: '1000 mg', purchasePrice: 6000, sellingPrice: 9000, currentStock: 85, minStockLevel: 25, expiryDate: new Date('2028-02-28'), location: 'Rayon H1' },
    { name: 'Bévitine B1-B6', genericName: 'Thiamine + Pyridoxine', category: 'Vitamines & Compléments', form: 'Comprimé', dosage: '250 mg', purchasePrice: 7000, sellingPrice: 10500, currentStock: 40, minStockLevel: 15, expiryDate: new Date('2027-08-14'), location: 'Rayon H2' },
    { name: 'Zinc 20 mg Comprimés', genericName: 'Sulfate de zinc', category: 'Vitamines & Compléments', form: 'Comprimé dispersible', dosage: '20 mg', purchasePrice: 4000, sellingPrice: 6500, currentStock: 70, minStockLevel: 20, expiryDate: new Date('2027-11-15'), location: 'Rayon H2' },
    { name: 'Sérum Physiologique 0.9%', genericName: 'Chlorure de sodium', category: 'Antalgiques & Antipyrétiques', form: 'Poche 500 ml', dosage: '0.9%', purchasePrice: 5500, sellingPrice: 8500, currentStock: 90, minStockLevel: 30, expiryDate: new Date('2028-04-30'), location: 'Réserve Solutés' },
    { name: 'Sérum Glucosé 5%', genericName: 'Glucose injectable', category: 'Antalgiques & Antipyrétiques', form: 'Poche 500 ml', dosage: '5%', purchasePrice: 6000, sellingPrice: 9000, currentStock: 60, minStockLevel: 25, expiryDate: new Date('2028-04-30'), location: 'Réserve Solutés' },
    { name: 'Célestène Gouttes 0.05%', genericName: 'Bétaméthasone', category: 'Anti-inflammatoires', form: 'Flacon compte-gouttes 30 ml', dosage: '0.05%', purchasePrice: 13500, sellingPrice: 19500, currentStock: 14, minStockLevel: 10, expiryDate: new Date('2027-02-18'), location: 'Rayon C3' },
    { name: 'Ventoline 100 µg', genericName: 'Salbutamol', category: 'Anti-inflammatoires', form: 'Flacon aérosol 200 doses', dosage: '100 µg', purchasePrice: 20000, sellingPrice: 29000, currentStock: 2, minStockLevel: 12, expiryDate: new Date('2026-09-25'), location: 'Rayon C4' }, // RUPTURE IMMINENTE
  ];

  const createdMedicines: any[] = [];
  for (const m of medicinesData) {
    const med = await prisma.medicine.create({
      data: {
        clinicId: clinic.id,
        name: m.name,
        genericName: m.genericName,
        categoryId: catMap[m.category],
        dosage: m.dosage,
        form: m.form,
        purchasePrice: m.purchasePrice,
        sellingPrice: m.sellingPrice,
        currentStock: m.currentStock,
        minStockLevel: m.minStockLevel,
        expiryDate: m.expiryDate,
        location: m.location,
        manufacturer: 'Fournisseur Certifié',
        isActive: true,
      },
    });
    createdMedicines.push(med);
  }
  console.log('✅ 30 Médicaments créés avec stocks et alertes');

  // 8. 20 Patients réalistes avec dossiers médicaux
  const patientsData = [
    { num: 'PAT-2026-0001', firstName: 'Jean-Baptiste', lastName: 'Ravalomanana', gender: Gender.MALE, birth: '1978-04-12', blood: 'O+', phone: '+261 34 11 222 01', email: 'jb.ravalo@gmail.com', address: 'Lot II A 45 Ambohimanarina', allergy: 'Pénicilline', chronic: 'Hypertension artérielle modérée', surgery: 'Appendicectomie en 2012', habits: 'Non-fumeur, thé vert' },
    { num: 'PAT-2026-0002', firstName: 'Marie Thérèse', lastName: 'Razafindrakoto', gender: Gender.FEMALE, birth: '1985-09-25', blood: 'A+', phone: '+261 34 11 222 02', email: 'marie.razafy@yahoo.fr', address: 'Lot IV F 12 Mahamasina', allergy: 'Arachides, Sulfamides', chronic: 'Asthme bronchique intermittent', surgery: 'Césarienne en 2017', habits: 'Aucun toxique' },
    { num: 'PAT-2026-0003', firstName: 'Andry Christian', lastName: 'Rakotomalala', gender: Gender.MALE, birth: '1992-11-03', blood: 'B+', phone: '+261 34 11 222 03', email: 'andry.rakoto@gmail.com', address: 'Lot III B 78 Itaosy', allergy: 'Aucune', chronic: 'Aucune', surgery: 'Fracture fémur gauche opérée en 2015', habits: 'Sportif régulier' },
    { num: 'PAT-2026-0004', firstName: 'Chantal', lastName: 'Rasoanantenaina', gender: Gender.FEMALE, birth: '1965-02-18', blood: 'AB+', phone: '+261 34 11 222 04', email: 'chantal.rasoa@moov.mg', address: 'Lot V K 89 Analamahitsy', allergy: 'Aspirine', chronic: 'Diabète de type 2, HTA', surgery: 'Cholécystectomie en 2019', habits: 'Régime pauvre en sel et sucre' },
    { num: 'PAT-2026-0005', firstName: 'Toky Nirina', lastName: 'Randrianasolo', gender: Gender.MALE, birth: '2001-07-30', blood: 'O-', phone: '+261 34 11 222 05', email: 'toky.randria@outlook.com', address: 'Lot I J 33 Talatamaty', allergy: 'Poussière, Acariens', chronic: 'Rhinite allergique', surgery: 'Aucune', habits: 'Étudiant' },
    { num: 'PAT-2026-0006', firstName: 'Haingo', lastName: 'Ramanandraibe', gender: Gender.FEMALE, birth: '1990-12-14', blood: 'A-', phone: '+261 34 11 222 06', email: 'haingo.ram@gmail.com', address: 'Lot VI M 50 Sabotsy Namehana', allergy: 'Aucune', chronic: 'Migraine ophtalmique', surgery: 'Aucune', habits: 'Café (2 tasses/jour)' },
    { num: 'PAT-2026-0007', firstName: 'Faly Herizo', lastName: 'Andriamanantena', gender: Gender.MALE, birth: '1982-06-08', blood: 'O+', phone: '+261 34 11 222 07', email: 'faly.andry@gmail.com', address: 'Lot II R 104 Ivato', allergy: 'Iode de contraste', chronic: 'Gastrite chronique', surgery: 'Hernie inguinale droite (2020)', habits: 'Fumeur modéré (5 cig/jour)' },
    { num: 'PAT-2026-0008', firstName: 'Sitraka Aina', lastName: 'Rabemananjara', gender: Gender.FEMALE, birth: '1998-03-22', blood: 'B-', phone: '+261 34 11 222 08', email: 'sitraka.rabe@gmail.com', address: 'Lot VII P 15 Tanjombato', allergy: 'Aucune', chronic: 'Anémie ferriprive récurrente', surgery: 'Aucune', habits: 'Végétarienne' },
    { num: 'PAT-2026-0009', firstName: 'Roland Guy', lastName: 'Randriamihaja', gender: Gender.MALE, birth: '1958-10-11', blood: 'AB-', phone: '+261 34 11 222 09', email: 'roland.randria@blueline.mg', address: 'Lot III G 62 Ampandrana', allergy: 'Pénicilline, Codéine', chronic: 'Insuffisance coronarienne, Dyslipidémie', surgery: 'Pontage aorto-coronarien en 2016', habits: 'Retraité, marche quotidienne' },
    { num: 'PAT-2026-0010', firstName: 'Eliane', lastName: 'Razanamparany', gender: Gender.FEMALE, birth: '2005-08-19', blood: 'O+', phone: '+261 34 11 222 10', email: 'eliane.raza@gmail.com', address: 'Lot I F 21 Mandroseza', allergy: 'Aucune', chronic: 'Aucune', surgery: 'Aucune', habits: 'Lycéenne' },
    { num: 'PAT-2026-0011', firstName: 'Mikael', lastName: 'Andriantsitohaina', gender: Gender.MALE, birth: '2019-05-14', blood: 'A+', phone: '+261 34 11 222 11', email: 'parents.mikael@gmail.com', address: 'Lot IV H 71 Isoraka', allergy: 'Oeufs', chronic: 'Eczéma atopique du nourrisson', surgery: 'Aucune', habits: 'Enfant (suivi pédiatrique)' },
    { num: 'PAT-2026-0012', firstName: 'Nomena Sophie', lastName: 'Raharimalala', gender: Gender.FEMALE, birth: '1988-01-27', blood: 'O+', phone: '+261 34 11 222 12', email: 'sophie.rahary@gmail.com', address: 'Lot V D 44 Ambohitrarahaba', allergy: 'Aucune', chronic: 'Grossesse en cours (24 SA)', surgery: 'Aucune', habits: 'Non-fumeuse, vitamines prénatales' },
    { num: 'PAT-2026-0013', firstName: 'Didier Patrick', lastName: 'Ratsimbazafy', gender: Gender.MALE, birth: '1974-09-09', blood: 'A+', phone: '+261 34 11 222 13', email: 'didier.ratsimba@gmail.com', address: 'Lot II N 19 Anosibe', allergy: 'Latex', chronic: 'Lombalgie chronique', surgery: 'Arthroscopie genou (2014)', habits: 'Activité sédentaire' },
    { num: 'PAT-2026-0014', firstName: 'Lova Lalaina', lastName: 'Rakotondrabe', gender: Gender.FEMALE, birth: '1995-11-15', blood: 'B+', phone: '+261 34 11 222 14', email: 'lova.rakoto@gmail.com', address: 'Lot III T 98 Ankorondrano', allergy: 'AINS', chronic: 'Ulcère gastroduodénal cicatrisé', surgery: 'Aucune', habits: 'Employée de bureau' },
    { num: 'PAT-2026-0015', firstName: 'Clément Eric', lastName: 'Rajaonarison', gender: Gender.MALE, birth: '1969-12-01', blood: 'O+', phone: '+261 34 11 222 15', email: 'clement.rajao@gmail.com', address: 'Lot VI B 14 Ambanidia', allergy: 'Aucune', chronic: 'Hyperuricémie (Goutte)', surgery: 'Aucune', habits: 'Régime surveillé' },
    { num: 'PAT-2026-0016', firstName: 'Volatiana', lastName: 'Razanadrakoto', gender: Gender.FEMALE, birth: '2003-04-05', blood: 'A-', phone: '+261 34 11 222 16', email: 'volatiana.raza@gmail.com', address: 'Lot I C 80 67 Ha', allergy: 'Pollen', chronic: 'Aucune', surgery: 'Amydalectomie (2010)', habits: 'Étudiante en sciences' },
    { num: 'PAT-2026-0017', firstName: 'Gérard', lastName: 'Andrianaivoravelo', gender: Gender.MALE, birth: '1952-03-17', blood: 'O+', phone: '+261 34 11 222 17', email: 'gerard.andrianaivo@gmail.com', address: 'Lot IV X 31 Tsimbazaza', allergy: 'Morphine', chronic: 'Arthrose bilatérale des genoux, DMLA', surgery: 'Prothèse totale genou gauche (2018)', habits: 'Canne de marche' },
    { num: 'PAT-2026-0018', firstName: 'Miora Hanta', lastName: 'Randrianarisoa', gender: Gender.FEMALE, birth: '1993-07-21', blood: 'AB+', phone: '+261 34 11 222 18', email: 'miora.randria@gmail.com', address: 'Lot II L 102 Andohalo', allergy: 'Aucune', chronic: 'Hypothyroïdie sous L-Thyroxine', surgery: 'Thyroïdectomie partielle (2019)', habits: 'Bilan semestriel TSH' },
    { num: 'PAT-2026-0019', firstName: 'Tahiry Zo', lastName: 'Rabenanahary', gender: Gender.MALE, birth: '1986-10-29', blood: 'B+', phone: '+261 34 11 222 19', email: 'tahiry.rabe@gmail.com', address: 'Lot V G 63 Alasora', allergy: 'Fruits de mer', chronic: 'Aucune', surgery: 'Appendicectomie (2005)', habits: 'Ingénieur en génie civil' },
    { num: 'PAT-2026-0020', firstName: 'Hantatiana', lastName: 'Ramiandrisoa', gender: Gender.FEMALE, birth: '1979-05-02', blood: 'O+', phone: '+261 34 11 222 20', email: 'hanta.ramiandra@gmail.com', address: 'Lot III E 55 Ambohipo', allergy: 'Céphalosporines', chronic: 'Syndrome du côlon irritable', surgery: 'Aucune', habits: 'Comptable' },
  ];

  const createdPatients: any[] = [];
  for (let i = 0; i < patientsData.length; i++) {
    const p = patientsData[i];
    const assignedDoctor = createdDoctors[i % createdDoctors.length];

    const patient = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        patientNumber: p.num,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        birthDate: new Date(p.birth),
        bloodGroup: p.blood,
        phone: p.phone,
        email: p.email,
        address: p.address,
        city: 'Antananarivo',
        emergencyContactName: 'Proche ' + p.lastName,
        emergencyContactPhone: p.phone,
        emergencyContactRel: 'Famille proche',
        primaryDoctorId: assignedDoctor.id,
        isActive: true,
      },
    });

    await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        allergies: p.allergy,
        chronicDiseases: p.chronic,
        surgicalHistory: p.surgery,
        familyHistory: 'Diabète ou HTA familiale fréquente',
        habits: p.habits,
        generalNotes: 'Dossier médical informatisé My Clinique créé lors de l’admission.',
      },
    });

    createdPatients.push(patient);
  }
  console.log('✅ 20 Patients et Dossiers Médicaux créés');

  // 9. Rendez-vous du jour et à venir
  const today = new Date();
  const appointmentTimes = ['08:30', '09:15', '10:00', '11:00', '14:00', '14:45', '15:30', '16:15'];
  const appointmentReasons = [
    'Consultation de routine et bilan de santé annuel',
    'Douleurs thoraciques atypiques et essoufflement à l’effort',
    'Fièvre persistante depuis 48h avec céphalées vives',
    'Suivi mensuel de grossesse et échographie obstétricale',
    'Éruption cutanée prurigineuse au niveau du tronc',
    'Renouvellement traitement antihypertenseur et contrôle tensionnel',
    'Bilan pédiatrique des 3 ans et mise à jour vaccinale',
    'Contrôle glycémie et ajustement du traitement antidiabétique',
  ];

  const createdAppointments: any[] = [];
  for (let i = 0; i < 8; i++) {
    const p = createdPatients[i];
    const d = createdDoctors[i % createdDoctors.length];
    const status = i === 0 ? AppointmentStatus.COMPLETED :
                   i === 1 ? AppointmentStatus.IN_PROGRESS :
                   i === 2 ? AppointmentStatus.CONFIRMED :
                   i === 3 ? AppointmentStatus.CONFIRMED :
                   AppointmentStatus.PENDING;

    const apt = await prisma.appointment.create({
      data: {
        patientId: p.id,
        doctorId: d.id,
        appointmentDate: today,
        startTime: appointmentTimes[i],
        endTime: appointmentTimes[i].replace('00', '30').replace('15', '45').replace('30', '00'),
        status,
        reason: appointmentReasons[i],
        notes: 'Patient invité à se présenter 10 minutes avant l’heure.',
      },
    });
    createdAppointments.push(apt);
  }
  console.log('✅ Rendez-vous du jour créés');

  // 10. Consultations médicales avec constantes vitales et diagnostics
  const consultationsData = [
    {
      patient: createdPatients[0],
      doctor: createdDoctors[0],
      reason: 'Bilan de santé annuel et contrôle tensionnel',
      symptoms: 'Légère fatigue en fin de journée, pas de vertiges ni de céphalées.',
      exam: 'État général conservé. Auscultation cardio-pulmonaire normale, pas de râles ni de souffles. Abdomen souple et indolore.',
      diagnosis: 'Hypertension artérielle stade 1 bien équilibrée sous traitement.',
      treatment: 'Poursuite de l’hygiène de vie, réduction du sodium alimentaire, contrôle dans 6 mois.',
      temp: 36.8, sysBP: 130, diaBP: 82, hr: 72, o2: 99.0, weight: 74.0, height: 172.0,
      medsToPrescribe: [0, 7], // Doliprane, Ibuprofène
    },
    {
      patient: createdPatients[1],
      doctor: createdDoctors[1],
      reason: 'Palpitations nocturnes et oppression thoracique',
      symptoms: 'Épisodes de tachycardie intermittente réveillant la patiente.',
      exam: 'Bruits du cœur réguliers. ECG réalisé : rythme sinusal avec rares extrasystoles auriculaires bénignes. Pouls bien frappés.',
      diagnosis: 'Tachycardie sinusale réactionnelle au stress et à l’anxiété.',
      treatment: 'Magnésium B6, repos, éviction des excitants (café/thé), anxiolytique léger si crise.',
      temp: 37.1, sysBP: 125, diaBP: 78, hr: 88, o2: 98.0, weight: 62.0, height: 165.0,
      medsToPrescribe: [23, 24], // Vitamine C, Bévitine
    },
    {
      patient: createdPatients[3],
      doctor: createdDoctors[0],
      reason: 'Suivi diabète type 2 et bilan podologique',
      symptoms: 'Polyurie modérée, soif nocturne occasionnelle.',
      exam: 'Examen des pieds normal, réflexes rotuliens et achilléens présents. Pression artérielle stable.',
      diagnosis: 'Diabète de type 2 modérément équilibré (HbA1c 7.2%).',
      treatment: 'Renforcement du régime diététique hypoglucidique, activité physique 30 min/jour, adaptation posologique.',
      temp: 36.9, sysBP: 135, diaBP: 85, hr: 76, o2: 97.5, weight: 82.0, height: 160.0,
      medsToPrescribe: [10, 13], // Amlodipine, Tahor
    },
    {
      patient: createdPatients[6],
      doctor: createdDoctors[4],
      reason: 'Lésion érythémateuse squameuse au coude droit',
      symptoms: 'Prurit intense le soir, desquamation argentée.',
      exam: 'Plaque érythémato-squameuse bien délimitée de 4 cm sur la face d’extension du coude droit. Pas d’atteinte unguéale.',
      diagnosis: 'Psoriasis en plaques localisé modéré.',
      treatment: 'Dermocorticoïde local en application quotidienne le soir pendant 15 jours.',
      temp: 36.7, sysBP: 120, diaBP: 80, hr: 68, o2: 99.0, weight: 78.0, height: 178.0,
      medsToPrescribe: [20, 21], // Bétadine, Fucidine
    },
  ];

  for (let idx = 0; idx < consultationsData.length; idx++) {
    const c = consultationsData[idx];
    const bmi = parseFloat((c.weight / Math.pow(c.height / 100, 2)).toFixed(1));

    const consultation = await prisma.consultation.create({
      data: {
        patientId: c.patient.id,
        doctorId: c.doctor.id,
        consultationDate: today,
        reason: c.reason,
        symptoms: c.symptoms,
        physicalExamination: c.exam,
        diagnosis: c.diagnosis,
        treatment: c.treatment,
        doctorNotes: 'Consultation complète avec observation clinique consignée.',
        status: ConsultationStatus.COMPLETED,
      },
    });

    await prisma.vitalSign.create({
      data: {
        consultationId: consultation.id,
        temperature: c.temp,
        systolicBP: c.sysBP,
        diastolicBP: c.diaBP,
        heartRate: c.hr,
        oxygenSaturation: c.o2,
        weight: c.weight,
        height: c.height,
        bmi,
      },
    });

    // Ordonnance liée
    const presNumber = `ORD-2026-000${idx + 1}`;
    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNumber: presNumber,
        patientId: c.patient.id,
        doctorId: c.doctor.id,
        consultationId: consultation.id,
        status: PrescriptionStatus.ACTIVE,
        qrCode: `https://myclinique.mg/verify/rx/${presNumber}`,
        doctorNotes: 'Prendre les médicaments selon la posologie stricte indiquée.',
        validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });

    for (const medIndex of c.medsToPrescribe) {
      const med = createdMedicines[medIndex];
      await prisma.prescriptionItem.create({
        data: {
          prescriptionId: prescription.id,
          medicineId: med.id,
          medicineName: med.name,
          dosage: med.dosage,
          form: med.form,
          quantity: 2,
          frequency: '1 comprimé matin et soir',
          duration: 'Pendant 7 jours',
          route: 'Voie orale',
          instructions: 'À prendre au milieu des repas avec un grand verre d’eau.',
        },
      });
    }

    // Facture liée à la consultation
    const invNumber = `FAC-2026-000${idx + 1}`;
    const consultPrice = 35000; // 35 000 Ar la consultation
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invNumber,
        clinicId: clinic.id,
        patientId: c.patient.id,
        consultationId: consultation.id,
        totalAmount: consultPrice,
        discountAmount: 0,
        taxAmount: 0,
        paidAmount: consultPrice,
        balance: 0,
        status: InvoiceStatus.PAID,
        issuedDate: today,
        notes: 'Paiement comptant consultation médicale.',
      },
    });

    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: 'Consultation Médecine Spécialisée',
        itemType: InvoiceItemType.CONSULTATION,
        quantity: 1,
        unitPrice: consultPrice,
        totalPrice: consultPrice,
      },
    });

    await prisma.payment.create({
      data: {
        paymentNumber: `PAY-2026-000${idx + 1}`,
        invoiceId: invoice.id,
        amount: consultPrice,
        paymentMethod: idx % 2 === 0 ? PaymentMethod.CASH : PaymentMethod.MOBILE_MONEY,
        reference: idx % 2 === 0 ? `RECU-CASH-${idx + 1}` : `MVOLA-TX-9988${idx}`,
        notes: 'Règlement reçu en caisse centrale.',
      },
    });

    // Journal de caisse
    await prisma.cashTransaction.create({
      data: {
        clinicId: clinic.id,
        type: CashTransactionType.INCOME,
        category: 'Consultation',
        amount: consultPrice,
        paymentMethod: idx % 2 === 0 ? PaymentMethod.CASH : PaymentMethod.MOBILE_MONEY,
        reference: invNumber,
        description: `Encaissement consultation ${c.patient.lastName} ${c.patient.firstName}`,
      },
    });
  }
  console.log('✅ Consultations, Constantes, Ordonnances et Factures associées créées');

  // 11. Factures d'actes additionnelles (dont certaines impayées et partielles pour les tests)
  const additionalInvoices = [
    { patient: createdPatients[4], total: 75000, paid: 75000, status: InvoiceStatus.PAID, desc: 'Bilan biologique complet (NFS, Glycémie, Bilan lipidique)' },
    { patient: createdPatients[5], total: 120000, paid: 50000, status: InvoiceStatus.PARTIALLY_PAID, desc: 'Échographie abdominale et pelvienne' },
    { patient: createdPatients[7], total: 45000, paid: 0, status: InvoiceStatus.UNPAID, desc: 'Radiographie pulmonaire face et profil' },
    { patient: createdPatients[8], total: 85000, paid: 0, status: InvoiceStatus.UNPAID, desc: 'Électrocardiogramme d’effort' },
  ];

  for (let i = 0; i < additionalInvoices.length; i++) {
    const inv = additionalInvoices[i];
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `FAC-2026-010${i + 1}`,
        clinicId: clinic.id,
        patientId: inv.patient.id,
        totalAmount: inv.total,
        discountAmount: 0,
        taxAmount: 0,
        paidAmount: inv.paid,
        balance: inv.total - inv.paid,
        status: inv.status,
        issuedDate: today,
        notes: 'Prestation clinique ambulatoire.',
      },
    });

    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: inv.desc,
        itemType: InvoiceItemType.MEDICAL_PROCEDURE,
        quantity: 1,
        unitPrice: inv.total,
        totalPrice: inv.total,
      },
    });

    if (inv.paid > 0) {
      await prisma.payment.create({
        data: {
          paymentNumber: `PAY-2026-010${i + 1}`,
          invoiceId: invoice.id,
          amount: inv.paid,
          paymentMethod: PaymentMethod.MOBILE_MONEY,
          reference: `AIRTEL-M-${i + 1}2345`,
          notes: 'Acompte versé par le patient.',
        },
      });

      await prisma.cashTransaction.create({
        data: {
          clinicId: clinic.id,
          type: CashTransactionType.INCOME,
          category: 'Actes médicaux',
          amount: inv.paid,
          paymentMethod: PaymentMethod.MOBILE_MONEY,
          reference: invoice.invoiceNumber,
          description: `Acompte acte médical pour ${inv.patient.lastName}`,
        },
      });
    }
  }
  console.log('✅ Factures supplémentaires créées (payées, partielles et impayées)');

  // 12. Ventes Pharmacie (POS) de démonstration
  const sale1 = await prisma.pharmacySale.create({
    data: {
      saleNumber: 'VTE-2026-0001',
      clinicId: clinic.id,
      customerName: 'Jean-Baptiste Ravalomanana',
      customerPhone: '+261 34 11 222 01',
      subtotal: 17000,
      discount: 0,
      total: 17000,
      paymentMethod: PaymentMethod.CASH,
      status: 'COMPLETED',
    },
  });

  await prisma.pharmacySaleItem.create({
    data: {
      pharmacySaleId: sale1.id,
      medicineId: createdMedicines[0].id,
      medicineName: createdMedicines[0].name,
      quantity: 2,
      unitPrice: createdMedicines[0].sellingPrice,
      totalPrice: createdMedicines[0].sellingPrice * 2,
    },
  });

  await prisma.pharmacySaleItem.create({
    data: {
      pharmacySaleId: sale1.id,
      medicineId: createdMedicines[7].id,
      medicineName: createdMedicines[7].name,
      quantity: 1,
      unitPrice: createdMedicines[7].sellingPrice,
      totalPrice: createdMedicines[7].sellingPrice,
    },
  });

  // Journal de caisse pharmacie
  await prisma.cashTransaction.create({
    data: {
      clinicId: clinic.id,
      type: CashTransactionType.INCOME,
      category: 'Pharmacie',
      amount: 17000,
      paymentMethod: PaymentMethod.CASH,
      reference: 'VTE-2026-0001',
      description: 'Vente pharmacie comptoir',
    },
  });
  console.log('✅ Vente pharmacie POS de test créée');

  // 13. Notifications système et alertes
  const notificationsData = [
    { title: 'Alerte Rupture Imminente', message: 'Le stock de Ventoline 100 µg est à 2 unités (seuil : 12). Commander d’urgence.', type: NotificationType.LOW_STOCK, linkUrl: '/pharmacy/stock' },
    { title: 'Alerte Stock Faible', message: 'Augmentin 1 g est en stock faible (8 unités restantes).', type: NotificationType.LOW_STOCK, linkUrl: '/pharmacy/stock' },
    { title: 'Péremption Proche', message: 'Le lot de Biafine Émulsion expire le 01/10/2026 (< 30 jours).', type: NotificationType.EXPIRY_WARNING, linkUrl: '/pharmacy/medicines' },
    { title: 'Nouveau Patient Enregistré', message: 'Dossier PAT-2026-0020 (Hantatiana Ramiandrisoa) créé avec succès.', type: NotificationType.NEW_PATIENT, linkUrl: '/patients' },
    { title: 'Paiement Reçu', message: 'Règlement de 35 000 Ar validé pour la facture FAC-2026-0001.', type: NotificationType.PAYMENT_RECEIVED, linkUrl: '/invoices' },
  ];

  for (const notif of notificationsData) {
    await prisma.notification.create({
      data: {
        clinicId: clinic.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        linkUrl: notif.linkUrl,
        isRead: false,
      },
    });
  }
  console.log('✅ Notifications initiales créées');

  // 14. Audit Log initial
  await prisma.auditLog.create({
    data: {
      clinicId: clinic.id,
      userId: adminUser.id,
      action: AuditAction.LOGIN,
      entity: 'System',
      details: 'Initialisation de la base de données et chargement du jeu d’essai complet.',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });
  console.log('✅ Audit Log initialisé');

  console.log('🎉 Seed My Clinique terminé avec grand succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
