import { toEthiopian } from "ethiopian-calendar-new";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Ethiopian months in English and Amharic
const ETHIOPIAN_MONTHS = {
  en: [
    "Meskerem",
    "Tikimt",
    "Hidar",
    "Tahsas",
    "Tir",
    "Yekatit",
    "Megabit",
    "Miyazia",
    "Ginbo",
    "Sene",
    "Hamle",
    "Nehase",
  ],
  am: [
    "መስከረም",
    "ጥቅምት",
    "ህዳር",
    "ታኅሣሥ",
    "ጥር",
    "የካቲት",
    "መጋቢት",
    "ሚያዝያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
  ],
};

// Message templates
const messageTemplates = {
  en: {
    dueSoon: (
      days: number,
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
    ) =>
      `🏠 *RENT DUE REMINDER*\n\n` +
      `📅 *Due: ${ETHIOPIAN_MONTHS.en[ethiopianDate.month - 1]} ${ethiopianDate.day}, ${ethiopianDate.year} (${days} days)*\n` +
      `🏢 *Room: ${roomName}*\n` +
      `👤 *Tenant: ${tenantName}*\n` +
      `💰 *Amount: ${amount} ETB*\n\n` +
      `🔔 *Status: PENDING*\n\n` +
      `Please remind the tenant to pay on time.`,

    overdue: (
      daysOverdue: number,
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
    ) =>
      `⚠️ *OVERDUE RENT PAYMENT*\n\n` +
      `📅 *Was Due: ${ETHIOPIAN_MONTHS.en[ethiopianDate.month - 1]} ${ethiopianDate.day}, ${ethiopianDate.year}*\n` +
      `🔴 *Overdue by: ${daysOverdue} days*\n` +
      `🏢 *Room: ${roomName}*\n` +
      `👤 *Tenant: ${tenantName}*\n` +
      `💰 *Amount: ${amount} ETB*\n\n` +
      `🔔 *Status: OVERDUE*\n\n` +
      `Immediate action required! Please contact the tenant.`,

    paid: (
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
    ) =>
      `✅ *PAYMENT RECEIVED*\n\n` +
      `📅 *Paid: ${ETHIOPIAN_MONTHS.en[ethiopianDate.month - 1]} ${ethiopianDate.day}, ${ethiopianDate.year}*\n` +
      `🏢 *Room: ${roomName}*\n` +
      `👤 *Tenant: ${tenantName}*\n` +
      `💰 *Amount: ${amount} ETB*\n\n` +
      `🔔 *Status: PAID*\n\n` +
      `Thank you! Payment recorded successfully.`,
  },
  am: {
    dueSoon: (
      days: number,
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
    ) =>
      `🏠 *የቤት ክፍያ ማስታወቂያ*\n\n` +
      `📅 *የሚከፈልበት: ${ETHIOPIAN_MONTHS.am[ethiopianDate.month - 1]} ${ethiopianDate.day} ቀን ${ethiopianDate.year} (${days} ቀናት)*\n` +
      `🏢 *ክፍል: ${roomName}*\n` +
      `👤 *ተከራይ: ${tenantName}*\n` +
      `💰 *መጠን: ${amount} ብር*\n\n` +
      `🔔 *ሁኔታ: ገና አልተከፈለም*\n\n` +
      `እባክዎ ተከራዩን በጊዜ መክፈል እንዲሞክሩ ያስተምሩ።`,

    overdue: (
      daysOverdue: number,
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
    ) =>
      `⚠️ *የተዘገበ የቤት ክፍያ*\n\n` +
      `📅 *መከፈል ነበረበት: ${ETHIOPIAN_MONTHS.am[ethiopianDate.month - 1]} ${ethiopianDate.day} ቀን ${ethiopianDate.year}*\n` +
      `🔴 *በጊዜ ያለፈ: ${daysOverdue} ቀናት*\n` +
      `🏢 *ክፍል: ${roomName}*\n` +
      `👤 *ተከራይ: ${tenantName}*\n` +
      `💰 *መጠን: ${amount} ብር*\n\n` +
      `🔔 *ሁኔታ: ተዘግቷል*\n\n` +
      `ወሲን ድርጊት ያስፈልጋል! እባክዎ ተከራዩን ይውሰዱ።`,

    paid: (
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
    ) =>
      `✅ *ክፍያ ተቀበለ*\n\n` +
      `📅 *ተከፈለ: ${ETHIOPIAN_MONTHS.am[ethiopianDate.month - 1]} ${ethiopianDate.day} ቀን ${ethiopianDate.year}*\n` +
      `🏢 *ክፍል: ${roomName}*\n` +
      `👤 *ተከራይ: ${tenantName}*\n` +
      `💰 *መጠን: ${amount} ብር*\n\n` +
      `🔔 *ሁኔታ: ተከፈለ*\n\n` +
      `እናመሰግናለን! ክፍያዉ በተሳካ ሁኔታ ተመዝግቧል።`,
  },
};

export async function checkRentNotifications() {
  const results = {
    sent: 0,
    failed: 0,
    details: [] as any[],
  };

  try {
    // Get current Ethiopian date
    const now = new Date();
    const ethiopianDate = toEthiopian(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );

    // Get rooms from your API
    const roomsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/rooms`,
    );
    if (!roomsResponse.ok) {
      throw new Error("Failed to fetch rooms");
    }
    const rooms = await roomsResponse.json();

    console.log(`📊 Found ${rooms.length} rooms to check`);

    for (const room of rooms) {
      console.log(
        `🏠 Checking room: ${room.name}, renters: ${room.renters.length}`,
      );

      if (room.renters.length === 0) {
        console.log(`   ⏭️  Skipping empty room`);
        continue; // Skip empty rooms
      }

      const renter = room.renters[0]; // Assuming one renter per room
      console.log(
        `   👤 Tenant: ${renter.fullName}, payments: ${room.rentPayments.length}`,
      );

      // Check each month for the next 30 days
      for (let daysAhead = 0; daysAhead <= 30; daysAhead++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + daysAhead);

        const ethiopianCheckDate = toEthiopian(
          checkDate.getFullYear(),
          checkDate.getMonth() + 1,
          checkDate.getDate(),
        );

        console.log(
          `   📅 Checking ${daysAhead} days ahead: ${ethiopianCheckDate.year}-${ethiopianCheckDate.month}-${ethiopianCheckDate.day} (monthIndex: ${ethiopianCheckDate.month - 1})`,
        );

        // Check if there's a payment record for this month
        const existingPayment = room.rentPayments.find(
          (p: any) =>
            p.year === ethiopianCheckDate.year &&
            p.monthIndex === ethiopianCheckDate.month - 1,
        );

        console.log(
          `   💳 Payment found: ${!!existingPayment}, paid: ${existingPayment?.isPaid}`,
        );

        if (!existingPayment || !existingPayment.isPaid) {
          console.log(`   🚨 Need to notify for this date!`);
          // Get owner's Telegram user ID (using your token storage)
          const telegramUserId = await getOwnerTelegramUserId(room.id);

          console.log(`   📱 Telegram user ID: ${telegramUserId}`);

          if (telegramUserId) {
            const language = await getUserLanguage(telegramUserId);
            const templates =
              messageTemplates[language as keyof typeof messageTemplates];

            let message: string;
            let type: string;

            if (daysAhead === 0 && !existingPayment) {
              // Overdue - due today but not paid
              const daysOverdue = calculateDaysOverdue(
                renter.moveIn,
                ethiopianCheckDate,
              );
              message = templates.overdue(
                daysOverdue,
                room.name,
                renter.fullName,
                5000,
                ethiopianCheckDate,
              );
              type = "overdue";
            } else if (
              daysAhead <= 3 &&
              (!existingPayment || !existingPayment.isPaid)
            ) {
              // Due soon (3 days or less) and unpaid
              message = templates.dueSoon(
                daysAhead,
                room.name,
                renter.fullName,
                5000,
                ethiopianCheckDate,
              );
              type = "due_soon";
            } else {
              console.log(
                `   ⏭️  Skipping - not within notification window (${daysAhead} days)`,
              );
              continue; // Skip if not within notification window
            }

            console.log(`   📤 Sending notification: ${type}`);

            // Send notification
            const sent = await sendTelegramNotification(
              telegramUserId,
              message,
            );

            console.log(`   ✅ Send result: ${sent}`);

            if (sent) {
              results.sent++;
              results.details.push({
                room: room.name,
                tenant: renter.fullName,
                type,
                message: message.substring(0, 50) + "...",
              });
            } else {
              results.failed++;
            }
          } else {
            console.log(`   ❌ No Telegram user found for room ${room.id}`);
          }
        } else {
          console.log(`   ✅ Payment already made or not needed`);
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error checking rent notifications:", error);
    throw error;
  }
}

// Helper functions using your token storage
async function getOwnerTelegramUserId(roomId: string): Promise<string | null> {
  // For now, return the first connected user (you can expand this later)
  // In a real system, you'd have a rooms->owners mapping
  const TOKEN_FILE = join(process.cwd(), "telegram-tokens.json");

  if (existsSync(TOKEN_FILE)) {
    const data = readFileSync(TOKEN_FILE, "utf-8");
    const tokens = new Map(JSON.parse(data));

    // Find the first user ID (not pending tokens)
    for (const [token, userId] of tokens.entries()) {
      if (userId !== "pending") {
        return userId as string;
      }
    }
  }

  return null;
}

async function getUserLanguage(telegramUserId: string): Promise<string> {
  // In a real system, you'd get this from the user's profile/dashboard preference
  // For now, we'll check if there's a global language preference stored
  // This should match the language selected in the dashboard (flag system)

  // Try to get language from a global settings file (could be set by dashboard)
  const GLOBAL_SETTINGS_FILE = join(process.cwd(), "global-settings.json");

  if (existsSync(GLOBAL_SETTINGS_FILE)) {
    const data = readFileSync(GLOBAL_SETTINGS_FILE, "utf-8");
    const settings = JSON.parse(data);
    if (
      settings.language &&
      (settings.language === "en" || settings.language === "am")
    ) {
      return settings.language;
    }
  }

  // Fallback to Telegram-specific language file (for backward compatibility)
  const LANG_FILE = join(process.cwd(), "telegram-languages.json");

  if (existsSync(LANG_FILE)) {
    const data = readFileSync(LANG_FILE, "utf-8");
    const languages = new Map(JSON.parse(data));
    const lang = languages.get(telegramUserId);
    return typeof lang === "string" ? lang : "en";
  }

  return "en"; // Default to English
}

async function sendTelegramNotification(
  telegramUserId: string,
  message: string,
) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramUserId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      },
    );

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}

function calculateDaysOverdue(moveInDate: any, currentDate: any): number {
  // Simple calculation - in production, use proper Ethiopian calendar math
  const now = new Date();
  return (
    (Math.floor(
      (now.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    ) %
      30) +
    1
  );
}
