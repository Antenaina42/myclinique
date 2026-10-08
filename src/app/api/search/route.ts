import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (q.length < 2) {
    return NextResponse.json({
      patients: [],
      doctors: [],
      medicines: [],
      prescriptions: [],
      invoices: [],
    });
  }

  try {
    const [patients, doctors, medicines, prescriptions, invoices] = await Promise.all([
      // Patients
      prisma.patient.findMany({
        where: {
          clinicId: session.clinicId,
          deletedAt: null,
          OR: [
            { lastName: { contains: q } },
            { firstName: { contains: q } },
            { patientNumber: { contains: q } },
            { phone: { contains: q } },
          ],
        },
        select: {
          id: true,
          patientNumber: true,
          firstName: true,
          lastName: true,
          phone: true,
          gender: true,
        },
        take: 5,
      }),

      // Médecins
      prisma.doctor.findMany({
        where: {
          clinicId: session.clinicId,
          OR: [
            { licenseNumber: { contains: q } },
            { user: { lastName: { contains: q } } },
            { user: { firstName: { contains: q } } },
            { specialty: { name: { contains: q } } },
          ],
        },
        include: {
          user: { select: { firstName: true, lastName: true } },
          specialty: { select: { name: true } },
        },
        take: 5,
      }),

      // Médicaments
      prisma.medicine.findMany({
        where: {
          clinicId: session.clinicId,
          isActive: true,
          OR: [
            { name: { contains: q } },
            { genericName: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          genericName: true,
          dosage: true,
          form: true,
          sellingPrice: true,
          currentStock: true,
        },
        take: 5,
      }),

      // Ordonnances
      prisma.prescription.findMany({
        where: {
          patient: { clinicId: session.clinicId },
          OR: [
            { prescriptionNumber: { contains: q } },
            { patient: { lastName: { contains: q } } },
            { patient: { firstName: { contains: q } } },
          ],
        },
        include: {
          patient: { select: { firstName: true, lastName: true, patientNumber: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        take: 5,
      }),

      // Factures
      prisma.invoice.findMany({
        where: {
          clinicId: session.clinicId,
          OR: [
            { invoiceNumber: { contains: q } },
            { patient: { lastName: { contains: q } } },
            { patient: { firstName: { contains: q } } },
          ],
        },
        include: {
          patient: { select: { firstName: true, lastName: true } },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      patients,
      doctors,
      medicines,
      prescriptions,
      invoices,
    });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({ error: 'Erreur lors de la recherche' }, { status: 500 });
  }
}
