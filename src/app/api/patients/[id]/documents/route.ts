import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DocumentCategory } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const documents = await prisma.patientDocument.findMany({
      where: { patientId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error('Get patient documents error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, fileUrl, fileType, fileSize, uploadedBy, notes } = body;

    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: 'Le titre et le fichier sont obligatoires' },
        { status: 400 }
      );
    }

    // Validate category or fallback to LAB_REPORT
    const validCategory = Object.values(DocumentCategory).includes(category)
      ? (category as DocumentCategory)
      : DocumentCategory.LAB_REPORT;

    const uploader =
      uploadedBy ||
      (session.firstName && session.lastName
        ? `${session.firstName} ${session.lastName}`
        : 'Praticien');

    const document = await prisma.patientDocument.create({
      data: {
        patientId: params.id,
        title: title.trim(),
        category: validCategory,
        fileUrl,
        fileType: fileType || 'application/pdf',
        fileSize: typeof fileSize === 'number' ? fileSize : null,
        uploadedBy: uploader,
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error('Create patient document error:', error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'enregistrement du document" },
      { status: 500 }
    );
  }
}
