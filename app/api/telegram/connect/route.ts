import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import crypto from "crypto";

// Simple file-based storage for development
const TOKEN_FILE = join(process.cwd(), "telegram-tokens.json");

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

// Generate token and save it immediately
function generateAndSaveToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const tokens = loadTokens();
  tokens.set(token, "pending"); // Mark as pending until user connects
  saveTokens(tokens);
  return token;
}

// In production, you'd get the owner ID from authentication
// For now, we'll use a simple approach
export async function POST(request: NextRequest) {
  try {
    const { ownerId } = await request.json();

    if (!ownerId) {
      return NextResponse.json(
        { error: "Owner ID is required" },
        { status: 400 },
      );
    }

    // Generate unique token for this owner
    const token = generateAndSaveToken();

    // In production, save this to your database:
    // UPDATE owners SET telegram_token = '{token}' WHERE id = '{ownerId}'

    // Create the deep link
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
