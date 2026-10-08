import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true },
  });

  const admin = users.find((u) => u.email === 'admin@myclinique.com');
  const doctor = users.find((u) => u.email === 'dr.dupont@myclinique.com');
  const pharmacist = users.find((u) => u.email === 'pharmacien@myclinique.com');
  const receptionist = users.find((u) => u.email === 'reception@myclinique.com');

  if (!doctor || !pharmacist || !receptionist || !admin) {
    console.log('Required users not found');
    return;
  }

  const clinicId = admin.clinicId;

  // Clear existing chat messages
  await prisma.chatMessage.deleteMany({ where: { clinicId } });

  // Conversation 1: Doctor <-> Pharmacist
  await prisma.chatMessage.create({
    data: {
      clinicId,
      senderId: doctor.id,
      receiverId: pharmacist.id,
      content: 'Bonjour Sarah, est-ce qu’on a encore de l’Amoxicilline 500mg en stock pour le patient Ravalomanana ?',
      isRead: true,
      readAt: new Date(Date.now() - 1000 * 60 * 35),
      createdAt: new Date(Date.now() - 1000 * 60 * 40),
    },
  });

  await prisma.chatMessage.create({
    data: {
      clinicId,
      senderId: pharmacist.id,
      receiverId: doctor.id,
      content: 'Bonjour Dr Dupont ! Oui, il nous reste 45 boîtes du lot AMX-2026-01. Vous pouvez prescrire sans problème.',
      isRead: true,
      readAt: new Date(Date.now() - 1000 * 60 * 25),
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  });

  await prisma.chatMessage.create({
    data: {
      clinicId,
      senderId: doctor.id,
      receiverId: pharmacist.id,
      content: 'Parfait, merci beaucoup pour la réactivité !',
      isRead: true,
      readAt: new Date(Date.now() - 1000 * 60 * 18),
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
    },
  });

  // Conversation 2: Receptionist -> Doctor (Unread for Doctor)
  await prisma.chatMessage.create({
    data: {
      clinicId,
      senderId: receptionist.id,
      receiverId: doctor.id,
      content: 'Docteur, votre patient de 11h (M. Jean-Baptiste) vient d’arriver en salle d’attente.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },
  });

  // Conversation 3: Admin -> Doctor
  await prisma.chatMessage.create({
    data: {
      clinicId,
      senderId: admin.id,
      receiverId: doctor.id,
      content: 'Bonjour Docteur, réunion du comité médical confirmée demain à 08h30 en salle de conférence.',
      isRead: true,
      readAt: new Date(Date.now() - 1000 * 60 * 60),
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
    },
  });

  // Conversation 4: Doctor -> Receptionist
  await prisma.chatMessage.create({
    data: {
      clinicId,
      senderId: doctor.id,
      receiverId: receptionist.id,
      content: 'Merci Aina, demandez-lui de préparer son carnet de santé s’il vous plaît.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  });

  // Conversation 5: Pharmacist -> Admin
  await prisma.chatMessage.create({
    data: {
      clinicId,
      senderId: pharmacist.id,
      receiverId: admin.id,
      content: 'Bonjour Alexandre, la commande fournisseur Salama est arrivée ce matin, bons de livraison validés.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    },
  });

  console.log('Chat messages seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
