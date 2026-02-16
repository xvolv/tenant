import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// Simple file-based storage for development
const TOKEN_FILE = join(process.cwd(), "telegram-tokens.json");
const LANG_FILE = join(process.cwd(), "telegram-languages.json");

// Load existing tokens
function loadTokens(): Map<string, string> {
  if (existsSync(TOKEN_FILE)) {
    const data = readFileSync(TOKEN_FILE, "utf-8");
    return new Map(JSON.parse(data));
  }
  return new Map();
}

// Save tokens
function saveTokens(tokens: Map<string, string>) {
  writeFileSync(TOKEN_FILE, JSON.stringify(Array.from(tokens.entries())));
}

// Load language preferences
function loadLanguages(): Map<string, string> {
  if (existsSync(LANG_FILE)) {
    const data = readFileSync(LANG_FILE, "utf-8");
    return new Map(JSON.parse(data));
  }
  return new Map();
}

// Save language preferences
function saveLanguages(languages: Map<string, string>) {
  writeFileSync(LANG_FILE, JSON.stringify(Array.from(languages.entries())));
}

// Store this in a database in production
let userTokens = loadTokens();
let userLanguage = loadLanguages();

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // Handle /start command with token
    if (update.message?.text?.startsWith("/start")) {
      const token = update.message.text.split(" ")[1];
      const telegramUserId = update.message.from.id.toString();
      const firstName = update.message.from.first_name;

      // Reload tokens to ensure we have the latest
      userTokens = loadTokens();

      if (token && userTokens.has(token)) {
        // Save the telegram user ID for this token
        userTokens.set(token, telegramUserId);
        saveTokens(userTokens);

        // Send confirmation message
        await sendTelegramMessage(
          telegramUserId,
          `✅ *Success!*\n\n` +
            `Hello ${firstName}! 🎉\n` +
            `You're now connected to the rent notification system.\n\n` +
            `🌐 *Choose your language:*\n` +
            `/langen - English\n` +
            `/langam - አማርኛ (Amharic)\n\n` +
            `You'll receive:\n` +
            `🏠 Rent due reminders\n` +
            `⏰ Late payment alerts\n` +
            `✅ Payment confirmations\n\n` +
            `Type /langen or /langam to set your preference.`,
        );

        return NextResponse.json({ ok: true });
      } else {
        await sendTelegramMessage(
          telegramUserId,
          `❌ *Invalid Link*\n\n` +
            `Please use the link from your rent management dashboard.`,
        );
      }
    }

    // Handle language selection
    if (
      update.message?.text === "/langen" ||
      update.message?.text === "/lang_en"
    ) {
      const telegramUserId = update.message.from.id.toString();
      userLanguage.set(telegramUserId, "en");
      saveLanguages(userLanguage);

      await sendTelegramMessage(
        telegramUserId,
        `✅ *Language Set*\n\n` +
          `You'll now receive notifications in English.\n\n` +
          `Type /langam to switch to Amharic anytime.`,
      );
      return NextResponse.json({ ok: true });
    }

    if (
      update.message?.text === "/langam" ||
      update.message?.text === "/lang_am"
    ) {
      const telegramUserId = update.message.from.id.toString();
      userLanguage.set(telegramUserId, "am");
      saveLanguages(userLanguage);

      await sendTelegramMessage(
        telegramUserId,
        `✅ *ቋንቋ ተለውጧል*\n\n` +
          `ማስታወቂያዎች በአማርኛ ይደረስዎታል።\n\n` +
          `ወደ እንግሊዝኛ ለመቀየር /langen ይጻፉ።`,
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    },
  );

  return response.json();
}

// Helper function to generate tokens (call this when creating owner accounts)
export function generateTelegramToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Helper function to get user's language preference
export function getUserLanguage(telegramUserId: string): string {
  return userLanguage.get(telegramUserId) || "en"; // Default to English
}

// Helper function to get telegram user ID (for n8n workflow)
export function getTelegramUserId(token: string): string | undefined {
  return userTokens.get(token);
}
