import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a one-time token and store it on the user record
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: `pending:${token}` }, // Temporarily store pending token
    });

    const botUsername = "saltenantbot"; // Your bot username
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
      success: true,
      deepLink,
      token,
      instructions: `
1. Click this link: ${deepLink}
2. It will open Telegram and start a chat with saltenantbot
3. Send the /start command (it should happen automatically)
4. You'll receive a confirmation message
5. Done! You'll now receive rent notifications
      `.trim(),
    });
  } catch (error) {
    console.error("Generate link error:", error);
    return NextResponse.json(
      { error: "Failed to generate connection link" },
      { status: 500 },
    );
  }
}
