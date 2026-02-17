import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
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

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const user = await getCurrentUser();

    if (!name) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.room.create({
      data: {
        name,
        ownerId: user.id,
      },
      include: {
        renters: true,
        rentPayments: true,
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}
