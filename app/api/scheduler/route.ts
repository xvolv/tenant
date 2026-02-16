import { NextRequest, NextResponse } from "next/server";
import scheduler from "@/lib/notificationScheduler";

// Global variable to track if scheduler is running
let isSchedulerStarted = false;

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case "start":
        if (!isSchedulerStarted) {
          scheduler.start();
          isSchedulerStarted = true;
          return NextResponse.json({ 
            success: true, 
            message: "Notification scheduler started" 
          });
        } else {
          return NextResponse.json({ 
            success: true, 
            message: "Notification scheduler already running" 
          });
        }

      case "stop":
        scheduler.stop();
        isSchedulerStarted = false;
        return NextResponse.json({ 
          success: true, 
          message: "Notification scheduler stopped" 
        });

      case "status":
        return NextResponse.json({ 
          success: true, 
          running: isSchedulerStarted,
          message: isSchedulerStarted ? "Scheduler is running" : "Scheduler is stopped"
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'start', 'stop', or 'status'" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Scheduler API error:", error);
    return NextResponse.json(
      { error: "Failed to process scheduler request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    running: isSchedulerStarted,
    message: isSchedulerStarted ? "Scheduler is running" : "Scheduler is stopped",
    endpoints: {
      start: "POST /api/scheduler with {action: 'start'}",
      stop: "POST /api/scheduler with {action: 'stop'}",
      status: "GET /api/scheduler or POST /api/scheduler with {action: 'status'}"
    }
  });
}
