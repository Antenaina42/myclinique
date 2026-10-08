import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generatePrescriptionPDF } from '@/lib/pdf';
import { calculateAge } from '@/lib/formatters';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const rx = await prisma.prescription.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          include: { clinic: true },
        },
        doctor: {
          include: {
            user: true,
            specialty: true,
          },
        },
        items: true,
      },
    });

    if (!rx) {
      return NextResponse.json({ error: 'Ordonnance introuvable' }, { status: 404 });
    }

    const doc = await generatePrescriptionPDF({
      prescriptionNumber: rx.prescriptionNumber,
      date: rx.createdAt,
      clinic: {
        name: rx.patient.clinic.name,
        address: rx.patient.clinic.address || 'Antananarivo, Madagascar',
        phone: rx.patient.clinic.phone || '+261 20 22 123 45',
        email: rx.patient.clinic.email || 'contact@myclinique.mg',
        currency: rx.patient.clinic.currency,
      },
      doctor: {
        name: `${rx.doctor.user.firstName} ${rx.doctor.user.lastName}`,
        specialty: rx.doctor.specialty.name,
        licenseNumber: rx.doctor.licenseNumber,
      },
      patient: {
        name: `${rx.patient.lastName} ${rx.patient.firstName}`,
        age: calculateAge(rx.patient.birthDate),
        gender: rx.patient.gender,
        patientNumber: rx.patient.patientNumber,
      },
      items: rx.items.map((i) => ({
        medicineName: i.medicineName,
        dosage: i.dosage,
        form: i.form,
        quantity: i.quantity,
        frequency: i.frequency,
        duration: i.duration,
        instructions: i.instructions || undefined,
      })),
      notes: rx.doctorNotes || undefined,
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${rx.prescriptionNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Prescription PDF error:', error);
    return NextResponse.json({ error: 'Erreur génération PDF : ' + error.message }, { status: 500 });
  }
}
