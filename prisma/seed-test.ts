import { PrismaClient } from "@prisma/client";
import { toEthiopian } from "ethiopian-calendar-new";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test data for notifications...");

  // Get current Ethiopian date
  const now = new Date();
  const ethiopianDate = toEthiopian(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  console.log(
    `Current Ethiopian date: ${ethiopianDate.year}-${ethiopianDate.month}-${ethiopianDate.day}`,
  );

  // Clean existing test data
  await prisma.rentPayment.deleteMany({
    where: { roomId: "test-room-notify" },
  });
  await prisma.renter.deleteMany({
    where: { roomId: "test-room-notify" },
  });
  await prisma.room.deleteMany({
    where: { id: "test-room-notify" },
  });

  // Create test room
  const room = await prisma.room.create({
    data: {
      id: "test-room-notify",
      name: "TEST ROOM - NOTIFICATION",
    },
  });
  console.log("Created test room:", room.name);

  // Create test renter
  const renter = await prisma.renter.create({
    data: {
      id: "test-renter-notify",
      fullName: "Test Tenant",
      phone: "+251911234567",
      nationalId: "TEST123456",
      roomId: room.id,
      moveInYear: ethiopianDate.year,
      moveInMonth: ethiopianDate.month,
      moveInDay: ethiopianDate.day - 5, // Moved in 5 days ago
    },
  });
  console.log("Created test renter:", renter.fullName);

  // Create rent payments for testing (some unpaid, some paid)
  const payments = [];

  // Current month - UNPAID (should trigger notification for today)
  payments.push({
    id: "payment-current",
    roomId: room.id,
    renterId: renter.id,
    year: ethiopianDate.year,
    monthIndex: ethiopianDate.month - 1, // Convert to 0-based
    isPaid: false,
  });

  // Next month - UNPAID (should trigger notification for future)
  const nextMonth = ethiopianDate.month === 12 ? 1 : ethiopianDate.month + 1;
  const nextYear =
    ethiopianDate.month === 12 ? ethiopianDate.year + 1 : ethiopianDate.year;

  payments.push({
    id: "payment-next",
    roomId: room.id,
    renterId: renter.id,
    year: nextYear,
    monthIndex: nextMonth - 1,
    isPaid: false,
  });

  // Two months ahead - UNPAID (should NOT trigger notification - too far)
  const futureMonth = nextMonth === 12 ? 1 : nextMonth + 1;
  const futureYear = nextMonth === 12 ? nextYear + 1 : nextYear;

  payments.push({
    id: "payment-future",
    roomId: room.id,
    renterId: renter.id,
    year: futureYear,
    monthIndex: futureMonth - 1,
    isPaid: false,
  });

  // Previous month - UNPAID (should trigger OVERDUE notification)
  const prevMonth = ethiopianDate.month === 1 ? 12 : ethiopianDate.month - 1;
  const prevYear =
    ethiopianDate.month === 1 ? ethiopianDate.year - 1 : ethiopianDate.year;

  payments.push({
    id: "payment-overdue",
    roomId: room.id,
    renterId: renter.id,
    year: prevYear,
    monthIndex: prevMonth - 1,
    isPaid: false,
  });

  // Insert all payments
  await prisma.rentPayment.createMany({
    data: payments,
  });

  console.log(`Created ${payments.length} rent payments:`);
  console.log("- Current month: UNPAID (will notify - due soon)");
  console.log("- Previous month: UNPAID (will notify - OVERDUE)");
  console.log("- Next month: UNPAID (will notify - due soon)");
  console.log("- Future month: UNPAID (will NOT notify - too far)");

  console.log("\n✅ Test data created!");
  console.log("Now run: http://localhost:3000/api/cron/notifications");
  console.log("You should receive 4 Telegram notifications!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
