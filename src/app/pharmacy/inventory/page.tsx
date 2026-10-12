import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { hasModuleAccess } from '@/lib/permissions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import InventoryClient from './InventoryClient';

export const dynamic = 'force-dynamic';

export default async function PharmacyInventoryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasModuleAccess(session.role, '/pharmacy')) {
    redirect('/dashboard?unauthorized=1');
  }

  const [medicines, categories] = await Promise.all([
    prisma.medicine.findMany({
      where: {
        clinicId: session.clinicId,
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.medicineCategory.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Sérialisation des données pour les composants clients
  const serializedMedicines = medicines.map((m) => ({
    ...m,
    expiryDate: m.expiryDate ? m.expiryDate.toISOString() : null,
  }));

  return (
    <DashboardLayout user={session}>
      <InventoryClient
        initialMedicines={serializedMedicines}
        categories={categories}
        userRole={session.role}
        clinicName={session.clinicName || 'Clinique Médicale'}
      />
    </DashboardLayout>
  );
}
