import { NextResponse } from "next/server";
import { removeSession } from "@/lib/session";

export async function POST() {
  try {
    await removeSession();
    return NextResponse.json(
      { message: "Logged out successfully." },
      { status: 200 },
    );
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
