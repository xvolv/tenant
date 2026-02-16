import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("Received update request for renter:", id, "with data:", body);

    const {
      fullName,
      phone,
      nationalId,
      moveInYear,
      moveInMonth,
      moveInDay,
      photoUrl,
    } = body;

    // Validate move-in date fields if provided
    if (moveInMonth !== undefined && (moveInMonth < 0 || moveInMonth > 11)) {
      console.error("Invalid moveInMonth:", moveInMonth);
      return NextResponse.json(
        { error: "Invalid moveInMonth. Must be between 0 and 11" },
        { status: 400 },
      );
    }

    if (moveInDay !== undefined && (moveInDay < 1 || moveInDay > 30)) {
      console.error("Invalid moveInDay:", moveInDay);
      return NextResponse.json(
        { error: "Invalid moveInDay. Must be between 1 and 30" },
        { status: 400 },
      );
    }

    const updateData: any = {
      ...(fullName && { fullName }),
      ...(phone && { phone }),
      ...(nationalId && { nationalId }),
      ...(moveInYear !== undefined && { moveInYear }),
      ...(moveInMonth !== undefined && { moveInMonth }),
      ...(moveInDay !== undefined && { moveInDay }),
      ...(photoUrl !== undefined && { photoUrl }),
    };

    console.log("Update data:", updateData);

    const renter = await prisma.renter.update({
      where: { id },
      data: updateData,
      include: {
        room: true,
      },
    });

    console.log("Successfully updated renter:", renter.id);
    return NextResponse.json(renter);
  } catch (error) {
    console.error("Failed to update renter:", error);
    return NextResponse.json(
      {
        error: "Failed to update renter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.renter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete renter:", error);
    return NextResponse.json(
      { error: "Failed to delete renter" },
      { status: 500 },
    );
  }
}
