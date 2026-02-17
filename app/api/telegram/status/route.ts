import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ connected: false });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { telegramChatId: true },
    });

    const connected = Boolean(
      dbUser?.telegramChatId && !dbUser.telegramChatId.startsWith("pending:"),
    );

    return NextResponse.json({
      connected,
      telegramUserId: connected ? dbUser!.telegramChatId : undefined,
    });
  } catch (error) {
    console.error("Error checking Telegram status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 },
    );
  }
}
