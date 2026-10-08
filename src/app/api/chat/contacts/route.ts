import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Fetch all active users in the clinic except the current user
    const users = await prisma.user.findMany({
      where: {
        clinicId: session.clinicId,
        id: { not: session.id },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: {
          select: {
            name: true,
            displayName: true,
          },
        },
        doctorProfile: {
          select: {
            specialty: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    // For each user, get the last message exchanged and unread count
    const contactsWithMeta = await Promise.all(
      users.map(async (u) => {
        const lastMessage = await prisma.chatMessage.findFirst({
          where: {
            clinicId: session.clinicId,
            OR: [
              { senderId: session.id, receiverId: u.id },
              { senderId: u.id, receiverId: session.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            isRead: true,
            createdAt: true,
          },
        });

        const unreadCount = await prisma.chatMessage.count({
          where: {
            clinicId: session.clinicId,
            senderId: u.id,
            receiverId: session.id,
            isRead: false,
          },
        });

        return {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          avatar: u.avatar,
          role: u.role.displayName,
          roleName: u.role.name,
          specialty: u.doctorProfile?.specialty?.name || null,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isSender: lastMessage.senderId === session.id,
                isRead: lastMessage.isRead,
              }
            : null,
          unreadCount,
        };
      })
    );

    // Sort: contacts with recent messages first, then alphabetically
    contactsWithMeta.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return a.lastName.localeCompare(b.lastName);
    });

    const totalUnread = contactsWithMeta.reduce((acc, c) => acc + c.unreadCount, 0);

    return NextResponse.json({ contacts: contactsWithMeta, totalUnread });
  } catch (error) {
    console.error('Error fetching chat contacts:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des contacts' }, { status: 500 });
  }
}
