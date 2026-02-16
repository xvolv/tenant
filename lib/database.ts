import { prisma } from "./prisma";
import { Room, Renter, RentPayment, EthiopianDate } from "@/lib/mockData";

// Convert database models to our existing types
export const dbToRoom = (
  room: any,
  renters: any[] = [],
  rentPayments: any[] = [],
): Room => ({
  id: room.id,
  name: room.name,
  renters: renters.map(dbToRenter),
  rentPayments: rentPayments.map(dbToRentPayment),
});

export const dbToRenter = (renter: any): Renter => ({
  id: renter.id,
  fullName: renter.fullName,
  phone: renter.phone,
  nationalId: renter.nationalId,
  roomId: renter.roomId,
  moveIn: {
    year: renter.moveInYear,
    monthIndex: renter.moveInMonth,
    day: renter.moveInDay,
  },
  moveOut: renter.moveOutYear
    ? {
        year: renter.moveOutYear,
        monthIndex: renter.moveOutMonth!,
        day: renter.moveOutDay!,
      }
    : undefined,
  photoUrl: renter.photoUrl,
});

export const dbToRentPayment = (payment: any): RentPayment => ({
  id: payment.id,
  roomId: payment.roomId,
  renterId: payment.renterId,
  year: payment.year,
  monthIndex: payment.monthIndex,
  isPaid: payment.isPaid,
});

// Database operations
export async function getRooms(): Promise<Room[]> {
  const rooms = await prisma.room.findMany({
    include: {
      renters: {
        orderBy: { createdAt: "asc" },
      },
      rentPayments: {
        orderBy: [{ year: "asc" }, { monthIndex: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  return rooms.map((room) => dbToRoom(room, room.renters, room.rentPayments));
}

export async function createRoom(name: string): Promise<Room> {
  const room = await prisma.room.create({
    data: { name },
    include: {
      renters: true,
      rentPayments: true,
    },
  });

  return dbToRoom(room, room.renters, room.rentPayments);
}

export async function createRenter(data: {
  fullName: string;
  phone: string;
  nationalId: string;
  roomId: string;
  moveIn: EthiopianDate;
  photoUrl?: string;
}): Promise<Renter> {
  const renter = await prisma.renter.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      nationalId: data.nationalId,
      roomId: data.roomId,
      moveInYear: data.moveIn.year,
      moveInMonth: data.moveIn.monthIndex,
      moveInDay: data.moveIn.day,
      photoUrl: data.photoUrl,
    },
    include: {
      room: true,
    },
  });

  return dbToRenter(renter);
}

export async function updateRenter(
  id: string,
  data: {
    fullName?: string;
    phone?: string;
    nationalId?: string;
    moveIn?: EthiopianDate;
    photoUrl?: string;
  },
): Promise<Renter> {
  const renter = await prisma.renter.update({
    where: { id },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.phone && { phone: data.phone }),
      ...(data.nationalId && { nationalId: data.nationalId }),
      ...(data.moveIn && {
        moveInYear: data.moveIn.year,
        moveInMonth: data.moveIn.monthIndex,
        moveInDay: data.moveIn.day,
      }),
      ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
    },
    include: {
      room: true,
    },
  });

  return dbToRenter(renter);
}

export async function deleteRenter(id: string): Promise<void> {
  await prisma.renter.delete({
    where: { id },
  });
}

export async function updateRentPayment(
  roomId: string,
  year: number,
  monthIndex: number,
  isPaid: boolean,
  renterId?: string,
): Promise<RentPayment> {
  const payment = await prisma.rentPayment.upsert({
    where: {
      roomId_year_monthIndex: {
        roomId,
        year,
        monthIndex,
      },
    },
    update: {
      isPaid,
      renterId,
    },
    create: {
      roomId,
      year,
      monthIndex,
      isPaid,
      renterId,
    },
  });

  return dbToRentPayment(payment);
}

export async function deleteRoom(id: string) {
  await prisma.room.delete({
    where: { id },
  });
}
