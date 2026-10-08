import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import prisma from '@/lib/prisma';
import SuppliersClient from './SuppliersClient';

export default async function SuppliersPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const suppliers = await prisma.supplier.findMany({
    where: { clinicId: session.clinicId },
    include: {
      _count: { select: { stockEntries: true } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <DashboardLayout user={session}>
      <SuppliersClient initialSuppliers={suppliers as any} user={session} />
    </DashboardLayout>
  );
}
