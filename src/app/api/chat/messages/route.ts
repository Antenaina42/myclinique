import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const recipientId = searchParams.get('recipientId');

  if (!recipientId) {
    return NextResponse.json({ error: 'Identifiant du destinataire manquant' }, { status: 400 });
  }

  try {
    // 1. Fetch message history
    const messages = await prisma.chatMessage.findMany({
      where: {
        clinicId: session.clinicId,
        OR: [
          { senderId: session.id, receiverId: recipientId },
          { senderId: recipientId, receiverId: session.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    // 2. Mark unread messages sent by recipientId to session.id as read
    await prisma.chatMessage.updateMany({
      where: {
        clinicId: session.clinicId,
        senderId: recipientId,
        receiverId: session.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Destinataire ou message vide.' }, { status: 400 });
    }

    // Verify recipient belongs to same clinic
    const recipient = await prisma.user.findFirst({
      where: {
        id: receiverId,
        clinicId: session.clinicId,
        isActive: true,
      },
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Destinataire introuvable dans cette clinique.' }, { status: 404 });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        clinicId: session.clinicId,
        senderId: session.id,
        receiverId,
        content: content.trim(),
        isRead: false,
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    });

    // Also push a subtle notification for the receiver
    await prisma.notification.create({
      data: {
        clinicId: session.clinicId,
        userId: receiverId,
        title: `Nouveau message de ${session.firstName} ${session.lastName}`,
        message: content.trim().length > 60 ? `${content.trim().slice(0, 60)}...` : content.trim(),
        linkUrl: '/dashboard',
        isRead: false,
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l’envoi du message' }, { status: 500 });
  }
}
