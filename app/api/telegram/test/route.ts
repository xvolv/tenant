import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: "Missing TELEGRAM_BOT_TOKEN" },
        { status: 500 },
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { telegramChatId: true },
    });

    const chatId = dbUser?.telegramChatId;
    if (!chatId || chatId.startsWith("pending:")) {
      return NextResponse.json(
        { error: "No Telegram user connected" },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const message =
      body.message ?? "Test notification from your SalTenant app 🏠";

    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram API error:", err);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "Test message sent" });
  } catch (error) {
    console.error("Test telegram error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
