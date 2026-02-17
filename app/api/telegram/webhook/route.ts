import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // Handle /start command with token
    if (update.message?.text?.startsWith("/start")) {
      const token = update.message.text.split(" ")[1];
      const telegramUserId = update.message.from.id.toString();
      const firstName = update.message.from.first_name;

      if (token) {
        // Find the user with this pending token
        const user = await prisma.user.findFirst({
          where: { telegramChatId: `pending:${token}` },
        });

        if (user) {
          // Store the actual chatId and clear the pending token
          await prisma.user.update({
            where: { id: user.id },
            data: { telegramChatId: telegramUserId },
          });

          // Send confirmation message
          await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: telegramUserId,
                text: `✅ Connected! You will now receive rent notifications for your account.\n\nWelcome, ${firstName}!`,
              }),
            },
          );
        } else {
          // Token not found or already used
          await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: telegramUserId,
                text: "❌ Invalid or expired connection link. Please try connecting again from your app settings.",
              }),
            },
          );
        }
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
