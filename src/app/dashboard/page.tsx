import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardClient from './DashboardClient';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Bornes temporelles pour aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  // Trouver l'entité Doctor si le rôle est DOCTOR
  let doctorEntity: any = null;
  if (session.role === 'DOCTOR') {
    doctorEntity = await prisma.doctor.findFirst({
      where: { userId: session.id },
    });
  }

  const [
    totalPatients,
    patientsToday,
    consultationsToday,
    appointmentsToday,
    unpaidSum,
    lowStockCount,
    expiringCount,
    recentAppointments,
    recentSales,
    salesTodayAgg,
    lowStockMedicines,
    recentPatients,
    recentConsultations,
    activeDoctorsCount,
    doctorAppointmentsToday,
    doctorConsultationsToday,
    doctorPrescriptionsCount,
  ] = await Promise.all([
    // Statistiques globales
    prisma.patient.count({ where: { clinicId: session.clinicId, deletedAt: null } }),
    prisma.patient.count({ where: { clinicId: session.clinicId, createdAt: { gte: today, lt: tomorrow }, deletedAt: null } }),
    prisma.consultation.count({ where: { patient: { clinicId: session.clinicId }, consultationDate: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { patient: { clinicId: session.clinicId }, appointmentDate: { gte: today, lt: tomorrow } } }),
    prisma.invoice.aggregate({
      where: { clinicId: session.clinicId, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
      _sum: { balance: true },
    }),
    prisma.medicine.count({ where: { clinicId: session.clinicId, isActive: true, currentStock: { lte: 10 } } }),
    prisma.medicine.count({ where: { clinicId: session.clinicId, isActive: true, expiryDate: { lte: thirtyDays } } }),

    // Rendez-vous du jour
    prisma.appointment.findMany({
      where: { patient: { clinicId: session.clinicId }, appointmentDate: { gte: today, lt: tomorrow } },
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: { startTime: 'asc' },
      take: 8,
    }),

    // Ventes pharmacie récentes
    prisma.pharmacySale.findMany({
      where: { clinicId: session.clinicId },
      include: { items: true },
      orderBy: { saleDate: 'desc' },
      take: 6,
    }),

    // Ventes pharmacie du jour
    prisma.pharmacySale.aggregate({
      where: { clinicId: session.clinicId, saleDate: { gte: today, lt: tomorrow } },
      _sum: { total: true },
      _count: true,
    }),

    // Médicaments en alerte stock
    prisma.medicine.findMany({
      where: { clinicId: session.clinicId, isActive: true, currentStock: { lte: 10 } },
      take: 5,
      orderBy: { currentStock: 'asc' },
    }),

    // Patients récents (Accueil)
    prisma.patient.findMany({
      where: { clinicId: session.clinicId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),

    // Consultations récentes (Médecin & Admin)
    prisma.consultation.findMany({
      where: { patient: { clinicId: session.clinicId } },
      include: { patient: true, doctor: { include: { user: true } } },
      orderBy: { consultationDate: 'desc' },
      take: 6,
    }),

    // Nombre de médecins actifs (Accueil)
    prisma.doctor.count({ where: { clinicId: session.clinicId, user: { isActive: true } } }),

    // Spécifiques au médecin connecté (si DOCTOR)
    doctorEntity
      ? prisma.appointment.findMany({
          where: { doctorId: doctorEntity.id, appointmentDate: { gte: today, lt: tomorrow } },
          include: { patient: true },
          orderBy: { startTime: 'asc' },
        })
      : Promise.resolve([]),

    doctorEntity
      ? prisma.consultation.count({
          where: { doctorId: doctorEntity.id, consultationDate: { gte: today, lt: tomorrow } },
        })
      : Promise.resolve(0),

    doctorEntity
      ? prisma.prescription.count({
          where: { doctorId: doctorEntity.id },
        })
      : Promise.resolve(0),
  ]);

  const initialStats = {
    totalPatients,
    patientsToday,
    consultationsToday,
    appointmentsToday,
    unpaidAmount: unpaidSum._sum.balance || 0,
    lowStockCount,
    expiringCount,
    salesTodayAmount: salesTodayAgg._sum.total || 0,
    salesTodayCount: salesTodayAgg._count || 0,
    activeDoctorsCount,
    doctorConsultationsToday,
    doctorPrescriptionsCount,
  };

  return (
    <DashboardLayout user={session}>
      <DashboardClient
        user={session}
        initialStats={initialStats}
        recentAppointments={recentAppointments}
        recentSales={recentSales}
        lowStockMedicines={lowStockMedicines}
        recentPatients={recentPatients}
        recentConsultations={recentConsultations}
        doctorAppointments={doctorAppointmentsToday}
      />
    </DashboardLayout>
  );
}
