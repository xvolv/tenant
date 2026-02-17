import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      roomName,
      fullName,
      phone,
      nationalId,
      moveInYear,
      moveInMonth,
      moveInDay,
      photoUrl,
    } = await request.json();

    if (!roomName || !fullName || !phone || !nationalId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          name: roomName,
          ownerId: user.id,
        },
        select: { id: true },
      });

      const renter = await tx.renter.create({
        data: {
          fullName,
          phone,
          nationalId,
          ownerId: user.id,
          roomId: room.id,
          moveInYear,
          moveInMonth,
          moveInDay,
          photoUrl,
        },
        include: {
          room: true,
        },
      });

      return { room, renter };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create room+renter:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = Array.isArray((error.meta as any)?.target)
          ? (error.meta as any).target.join(", ")
          : String((error.meta as any)?.target ?? "unique field");
        const isNationalIdDup = target.includes("nationalId");
        const message = isNationalIdDup
          ? "Check the national ID: it is being repeated."
          : `A renter with this ${target} already exists.`;
        return NextResponse.json(
          {
            error: message,
            code: error.code,
          },
          { status: 409 },
        );
      }
    }

    const isProd = process.env.NODE_ENV === "production";
    return NextResponse.json(
      {
        error: "Failed to create room+renter",
        ...(isProd
          ? {}
          : {
              details: error instanceof Error ? error.message : String(error),
            }),
      },
      { status: 500 },
    );
  }
}
