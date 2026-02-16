import { NextRequest, NextResponse } from "next/server";
import { checkRentNotifications } from "@/lib/notificationService";

export async function GET() {
  return NextResponse.json({
    message: "Rent notification cron endpoint",
    schedule: "Runs at 9:00 AM, 3:00 PM, and 9:00 PM daily",
    method: "POST to trigger notifications",
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron request (Vercel adds a special header)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional: Add security check
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // For development, you might want to skip this check
      console.log("⚠️  No cron secret verification");
    }

    console.log("🔄 Vercel cron job triggered:", new Date().toISOString());

    const results = await checkRentNotifications();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      triggered_by: "vercel-cron",
      results,
    });
  } catch (error) {
    console.error("Vercel cron error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
