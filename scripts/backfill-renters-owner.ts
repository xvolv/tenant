import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const renters = await prisma.renter.findMany({
    where: { ownerId: null },
    select: {
      id: true,
      roomId: true,
      room: { select: { ownerId: true } },
    },
  });

  let updated = 0;
  for (const renter of renters) {
    const ownerId = renter.room.ownerId;
    if (!ownerId) continue;

    await prisma.renter.update({
      where: { id: renter.id },
      data: { ownerId },
    });
    updated++;
  }

  console.log(`Backfilled ownerId for ${updated} renters (skipped ${renters.length - updated}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
