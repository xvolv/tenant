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
  moveInYear: renter.moveInYear,
  moveInMonth: renter.moveInMonth,
  moveInDay: renter.moveInDay,
  moveOutYear: renter.moveOutYear,
  moveOutMonth: renter.moveOutMonth,
  moveOutDay: renter.moveOutDay,
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

// Database operations using API routes
export async function getRooms(): Promise<Room[]> {
  const response = await fetch("/api/rooms");
  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }
  const rooms = await response.json();

  return rooms.map((room: any) =>
    dbToRoom(room, room.renters, room.rentPayments),
  );
}

export async function createRoom(name: string): Promise<Room> {
  const response = await fetch("/api/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  const room = await response.json();
  return dbToRoom(room, room.renters, room.rentPayments);
}

export async function createRenter(data: {
  fullName: string;
  phone: string;
  nationalId: string;
  roomId: string;
  moveInYear: number;
  moveInMonth: number;
  moveInDay: number;
  photoUrl?: string;
}): Promise<Renter> {
  const response = await fetch("/api/renters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: data.fullName,
      phone: data.phone,
      nationalId: data.nationalId,
      roomId: data.roomId,
      moveInYear: data.moveInYear,
      moveInMonth: data.moveInMonth,
      moveInDay: data.moveInDay,
      photoUrl: data.photoUrl,
    }),
  });

  if (!response.ok) {
    let message = "Failed to create renter";
    try {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const body = await response.json();
        if (body?.error && typeof body.error === "string") {
          message = body.error;
        } else {
          message = `${message}: ${JSON.stringify(body)}`;
        }
      } else {
        const text = await response.text();
        if (text) message = `${message}: ${text}`;
      }
    } catch {
      // ignore parsing errors
    }
    throw new Error(message);
  }

  const renter = await response.json();
  return dbToRenter(renter);
}

export async function updateRenter(
  id: string,
  data: {
    fullName?: string;
    phone?: string;
    nationalId?: string;
    moveInYear?: number;
    moveInMonth?: number;
    moveInDay?: number;
    photoUrl?: string;
  },
): Promise<Renter> {
  try {
    const requestBody = {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.phone && { phone: data.phone }),
      ...(data.nationalId && { nationalId: data.nationalId }),
      ...(data.moveInYear !== undefined && { moveInYear: data.moveInYear }),
      ...(data.moveInMonth !== undefined && { moveInMonth: data.moveInMonth }),
      ...(data.moveInDay !== undefined && { moveInDay: data.moveInDay }),
      ...(data.photoUrl && { photoUrl: data.photoUrl }),
    };

    console.log(
      "Sending update request for renter:",
      id,
      "with body:",
      requestBody,
    );

    const response = await fetch(`/api/renters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Update failed with status:",
        response.status,
        "Response:",
        errorText,
      );
      throw new Error(
        `Failed to update renter: ${response.status} ${errorText}`,
      );
    }

    const renter = await response.json();
    console.log("Update successful:", renter);
    return dbToRenter(renter);
  } catch (error) {
    console.error("Error in updateRenter:", error);
    throw error;
  }
}

export async function deleteRenter(id: string): Promise<void> {
  const response = await fetch(`/api/renters/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete renter");
  }
}

export async function updateRentPayment(
  roomId: string,
  year: number,
  monthIndex: number,
  isPaid: boolean,
  renterId?: string,
): Promise<RentPayment> {
  const response = await fetch("/api/payments", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      roomId,
      year,
      monthIndex,
      isPaid,
      renterId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update payment");
  }

  const payment = await response.json();
  return dbToRentPayment(payment);
}

export async function deleteRoom(id: string): Promise<void> {
  const response = await fetch(`/api/rooms/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete room");
  }
}
