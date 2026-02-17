import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignRoomsToUser() {
  const email = 'salassefa@gmail.com';

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email ${email} not found.`);
    return;
  }

  console.log(`Found user: ${user.fullName} (${user.id})`);

  // Update all rooms that don't have an ownerId
  const result = await prisma.room.updateMany({
    where: { ownerId: null },
    data: { ownerId: user.id },
  });

  console.log(`Updated ${result.count} rooms to belong to ${email}`);
}

assignRoomsToUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
