import { toEthiopian, toGregorian } from "ethiopian-calendar-new";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Type definition for Ethiopian date
interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthIndex?: number;
}

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
    "Miazia",
    "Ginbot",
    "Sene",
    "Hamle",
    "Nehase",
    "Pagume",
  ],
  am: [
    "መስከረም",
    "ጥቅምት",
    "ህዳር",
    "ታህሣሥ",
    "ጥር",
    "የካቲት",
    "መጋቢት",
    "ሚያዝያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
    "ጳጉሜን",
  ],
};

// Message templates
const messageTemplates = {
  en: {
    moveInToday: (roomName: string, tenantName: string, ethiopianDate: any) =>
      `📅 *Today: ${ETHIOPIAN_MONTHS.en[ethiopianDate.month - 1]} ${ethiopianDate.day}, ${ethiopianDate.year}*\n\n` +
      `🏠 *NEW TENANT MOVING IN TODAY*\n\n` +
      `🏢 *Room: ${roomName}*\n` +
      `👤 *Tenant: ${tenantName}*\n\n` +
      `🔔 *Status: MOVE-IN TODAY*\n\n` +
      `A new tenant is moving in today. Prepare the room!`,

    moveInTomorrow: (
      roomName: string,
      tenantName: string,
      ethiopianDate: any,
    ) =>
      `📅 *Today: ${ETHIOPIAN_MONTHS.en[ethiopianDate.month - 1]} ${ethiopianDate.day}, ${ethiopianDate.year}*\n\n` +
      `🏠 *TENANT MOVING IN TOMORROW*\n\n` +
      `🏢 *Room: ${roomName}*\n` +
      `👤 *Tenant: ${tenantName}*\n\n` +
      `🔔 *Status: MOVE-IN TOMORROW*\n\n` +
      `A new tenant will be moving in tomorrow. Please prepare the room!`,

    dueSoon: (
      days: number,
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
      todayDate: any,
    ) =>
      `📅 *Today: ${ETHIOPIAN_MONTHS.en[todayDate.month - 1]} ${todayDate.day}, ${todayDate.year}*\n\n` +
      `🏠 *RENT DUE REMINDER*\n\n` +
      `📅 *Due: ${ETHIOPIAN_MONTHS.en[ethiopianDate.month - 1]} ${ethiopianDate.day}, ${ethiopianDate.year} (${days} days)*\n` +
      `🏢 *Room: ${roomName}*\n` +
      `👤 *Tenant: ${tenantName}*\n\n` +
      `🔔 *Status: PENDING*\n\n` +
      `Please remind the tenant to pay on time.`,

    dueToday: (
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
      todayDate: any,
    ) =>
      `📅 *Today: ${ETHIOPIAN_MONTHS.en[todayDate.month - 1]} ${todayDate.day}, ${todayDate.year}*\n\n` +
      `🏠 *RENT DUE TODAY*\n\n` +
      `📅 *Due: ${ETHIOPIAN_MONTHS.en[ethiopianDate.month - 1]} ${ethiopianDate.day}, ${ethiopianDate.year}*\n` +
      `🏢 *Room: ${roomName}*\n` +
      `👤 *Tenant: ${tenantName}*\n\n` +
      `🔔 *Status: DUE TODAY*\n\n` +
      `Payment is due today. Please remind the tenant.`,

    paid: (
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
      todayDate: any,
    ) =>
      `📅 *Today: ${ETHIOPIAN_MONTHS.en[todayDate.month - 1]} ${todayDate.day}, ${todayDate.year}*\n\n` +
      `✅ *PAYMENT RECEIVED*\n\n` +
      `📅 *Paid: ${ETHIOPIAN_MONTHS.en[ethiopianDate.month - 1]} ${ethiopianDate.day}, ${ethiopianDate.year}*\n` +
      `🏢 *Room: ${roomName}*\n` +
      `👤 *Tenant: ${tenantName}*\n\n` +
      `🔔 *Status: PAID*\n\n` +
      `Thank you! Payment recorded successfully.`,
  },
  am: {
    moveInToday: (roomName: string, tenantName: string, ethiopianDate: any) =>
      `📅 *ዛሬ: ${ETHIOPIAN_MONTHS.am[ethiopianDate.month - 1]} ${ethiopianDate.day} ቀን ${ethiopianDate.year}*\n\n` +
      `🏠 *አዲስ ተከራይ ዛሄድ ይገባል*\n\n` +
      `🏢 *ክፍል: ${roomName}*\n` +
      `👤 *ተከራይ: ${tenantName}*\n\n` +
      `🔔 *ሁኔታ: ዛሄድ ገባ*\n\n` +
      `አዲስ ተከራይ ዛሄድ ይገባል። ክፍሉን ያዘጋጁ!`,

    moveInTomorrow: (
      roomName: string,
      tenantName: string,
      ethiopianDate: any,
    ) =>
      `📅 *ዛሄድ: ${ETHIOPIAN_MONTHS.am[ethiopianDate.month - 1]} ${ethiopianDate.day} ቀን ${ethiopianDate.year}*\n\n` +
      `🏠 *ተከራይ ነገ ይገባል*\n\n` +
      `🏢 *ክፍል: ${roomName}*\n` +
      `👤 *ተከራይ: ${tenantName}*\n\n` +
      `🔔 *ሁኔታ: ነገ ገባ*\n\n` +
      `አዲስ ተከራይ ነገ ይገባል። ክፍሉን ያዘጋጁ!`,

    dueSoon: (
      days: number,
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
      todayDate: any,
    ) =>
      `📅 *ዛሬ: ${ETHIOPIAN_MONTHS.am[todayDate.month - 1]} ${todayDate.day} ቀን ${todayDate.year}*\n\n` +
      `🏠 *የቤት ክፍያ ማስታወቂያ*\n\n` +
      `📅 *የሚከፈልበት: ${ETHIOPIAN_MONTHS.am[ethiopianDate.month - 1]} ${ethiopianDate.day} ቀን ${ethiopianDate.year} (${days} ቀናት)*\n` +
      `🏢 *ክፍል: ${roomName}*\n` +
      `👤 *ተከራይ: ${tenantName}*\n\n` +
      `🔔 *ሁኔታ: ገና አልተከፈለም*\n\n` +
      `እባክዎ ተከራዩን በጊዜ መክፈል እንዲሞክሩ ያስተምሩ።`,

    dueToday: (
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
      todayDate: any,
    ) =>
      `📅 *ዛሬ: ${ETHIOPIAN_MONTHS.am[todayDate.month - 1]} ${todayDate.day} ቀን ${todayDate.year}*\n\n` +
      `🏠 *የቤት ክፍያ ዛሬ ይከፈላል*\n\n` +
      `📅 *የሚከፈልበት: ${ETHIOPIAN_MONTHS.am[ethiopianDate.month - 1]} ${ethiopianDate.day} ቀን ${ethiopianDate.year}*\n` +
      `🏢 *ክፍል: ${roomName}*\n` +
      `👤 *ተከራይ: ${tenantName}*\n\n` +
      `🔔 *ሁኔታ: ዛሬ ይከፈላል*\n\n` +
      `ክፍያ ዛሬ ይከፈላል። እባክዎ ተከራዩን ያስተምሩ።`,

    paid: (
      roomName: string,
      tenantName: string,
      amount: number,
      ethiopianDate: any,
      todayDate: any,
    ) =>
      `📅 *ዛሬ: ${ETHIOPIAN_MONTHS.am[todayDate.month - 1]} ${todayDate.day} ቀን ${todayDate.year}*\n\n` +
      `✅ *ክፍያ ተቀበለ*\n\n` +
      `📅 *ተከፈለ: ${ETHIOPIAN_MONTHS.am[ethiopianDate.month - 1]} ${ethiopianDate.day} ቀን ${ethiopianDate.year}*\n` +
      `🏢 *ክፍል: ${roomName}*\n` +
      `👤 *ተከራይ: ${tenantName}*\n\n` +
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
  let notificationsSent = 0;

  try {
    // Get current Ethiopian date directly
    const now = new Date();
    const ethiopianToday = toEthiopian(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );

    console.log(
      `📅 Today is: ${ETHIOPIAN_MONTHS.en[ethiopianToday.month - 1]} ${ethiopianToday.day}, ${ethiopianToday.year}`,
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

    // Check each room for rent due notifications
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

      // Transform database moveIn fields to EthiopianDate object
      const moveInDate: EthiopianDate = {
        year: renter.moveInYear,
        month: renter.moveInMonth + 1, // Convert 0-indexed to 1-indexed
        day: renter.moveInDay,
        monthIndex: renter.moveInMonth,
      };

      console.log(
        `   📥 Move-in date: ${ETHIOPIAN_MONTHS.en[moveInDate.month - 1]} ${moveInDate.day}, ${moveInDate.year}`,
      );

      // === MOVE-IN NOTIFICATION CHECK ===
      // Check if today or tomorrow is the renter's move-in date
      const isMoveInToday =
        moveInDate.year === ethiopianToday.year &&
        moveInDate.month === ethiopianToday.month &&
        moveInDate.day === ethiopianToday.day;

      // Calculate tomorrow's date in Ethiopian calendar
      const tomorrowGregorian = new Date(now);
      tomorrowGregorian.setDate(tomorrowGregorian.getDate() + 1);
      const ethiopianTomorrow = toEthiopian(
        tomorrowGregorian.getFullYear(),
        tomorrowGregorian.getMonth() + 1,
        tomorrowGregorian.getDate(),
      );

      const isMoveInTomorrow =
        moveInDate.year === ethiopianTomorrow.year &&
        moveInDate.month === ethiopianTomorrow.month &&
        moveInDate.day === ethiopianTomorrow.day;

      console.log(
        `   🏠 Move-in today: ${isMoveInToday}, tomorrow: ${isMoveInTomorrow}`,
      );

      // Send move-in notification if today or tomorrow
      if (isMoveInToday || isMoveInTomorrow) {
        const telegramUserId = await getOwnerTelegramUserId(room.id);

        if (telegramUserId) {
          const language = await getUserLanguage(telegramUserId);
          const templates =
            messageTemplates[language as keyof typeof messageTemplates];

          const message = isMoveInToday
            ? templates.moveInToday(room.name, renter.fullName, ethiopianToday)
            : templates.moveInTomorrow(
                room.name,
                renter.fullName,
                ethiopianToday,
              );

          const type = isMoveInToday ? "move_in_today" : "move_in_tomorrow";

          try {
            const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
            const response = await fetch(telegramApiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chat_id: telegramUserId,
                text: message,
                parse_mode: "HTML",
              }),
            });

            if (response.ok) {
              notificationsSent++;
              console.log(`   ✅ Move-in notification sent!`);
            }
          } catch (error) {
            console.error(`   ❌ Failed to send move-in notification:`, error);
          }
        }
      }

      // Calculate due date directly in Ethiopian calendar
      // Rent is due on the same day each month as move-in day
      const dueThisMonth: EthiopianDate = {
        year: ethiopianToday.year,
        month: ethiopianToday.month,
        day: moveInDate.day,
        monthIndex: ethiopianToday.month - 1,
      };

      console.log(
        `   📅 Due this month: ${ETHIOPIAN_MONTHS.en[dueThisMonth.month - 1]} ${dueThisMonth.day}, ${dueThisMonth.year}`,
      );

      // Calculate days until due (working with Ethiopian dates)
      let daysUntilDue = 0;

      // If today is before due date in the same month
      if (ethiopianToday.day < dueThisMonth.day) {
        daysUntilDue = dueThisMonth.day - ethiopianToday.day;
      }
      // If today is the due date
      else if (ethiopianToday.day === dueThisMonth.day) {
        daysUntilDue = 0;
      }
      // If today is after due date, rent is overdue (but we don't send notifications)
      else {
        daysUntilDue = -1; // Overdue
      }

      console.log(`   ⏰ Days until due: ${daysUntilDue}`);

      // Check if there's a payment record for this month
      const existingPayment = room.rentPayments.find(
        (p: any) =>
          p.year === ethiopianToday.year &&
          p.monthIndex === ethiopianToday.month - 1,
      );

      console.log(
        `   💳 Payment found: ${!!existingPayment}, paid: ${existingPayment?.isPaid}`,
      );

      // Only send notifications if not already paid and within notification window
      if (!existingPayment || !existingPayment.isPaid) {
        // Check if we're in the notification window (3 days before due date, including due date)
        if (daysUntilDue >= 0 && daysUntilDue <= 3) {
          console.log(`   🚨 Within notification window!`);

          // Get owner's Telegram user ID
          const telegramUserId = await getOwnerTelegramUserId(room.id);
          console.log(`   📱 Telegram user ID: ${telegramUserId}`);

          if (telegramUserId) {
            const language = await getUserLanguage(telegramUserId);
            const templates =
              messageTemplates[language as keyof typeof messageTemplates];

            let message: string;
            let type: string;

            if (daysUntilDue === 0) {
              // Due today
              message = templates.dueToday(
                room.name,
                renter.fullName,
                5000,
                dueThisMonth,
                ethiopianToday,
              );
              type = "due_today";
            } else {
              // Due in 1-3 days
              message = templates.dueSoon(
                daysUntilDue,
                room.name,
                renter.fullName,
                5000,
                dueThisMonth,
                ethiopianToday,
              );
              type = "due_soon";
            }

            try {
              const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
              const response = await fetch(telegramApiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  chat_id: telegramUserId,
                  text: message,
                  parse_mode: "HTML",
                }),
              });

              const sent = response.ok;
              console.log(`   ✅ Send result: ${sent}`);

              if (sent) {
                notificationsSent++;
              }
            } catch (error) {
              console.error(
                `   ❌ Failed to send Telegram notification:`,
                error,
              );
            }
          } else {
            console.log(`   ❌ No Telegram user found for room ${room.id}`);
          }
        } else {
          console.log(
            `   ⏭️  Outside notification window (${daysUntilDue} days)`,
          );
        }
      } else {
        console.log(`   ✅ Payment already recorded for this month`);
      }
    }

    return results;
  } catch (error) {
    console.error("Error checking rent notifications:", error);
    throw error;
  }
}

// Helper function to find the next rent due date
function getNextRentDueDate(
  moveIn: EthiopianDate,
  currentDate: Date,
): Date | null {
  try {
    // Validate input
    if (!moveIn || !moveIn.year || !moveIn.month || !moveIn.day) {
      console.error("Invalid moveIn date:", moveIn);
      return null;
    }

    console.log("🔍 getNextRentDueDate called with:");
    console.log("   Move-in:", moveIn);
    console.log("   Current date:", currentDate);

    // Convert move-in date to Gregorian for comparison using the library function
    const moveInGregorian = toGregorian(moveIn.year, moveIn.month, moveIn.day);

    // Validate conversion result
    if (
      !moveInGregorian ||
      !moveInGregorian.year ||
      !moveInGregorian.month ||
      !moveInGregorian.day
    ) {
      console.error("Invalid Gregorian conversion result:", moveInGregorian);
      return null;
    }

    console.log("   Converted to Gregorian:", moveInGregorian);

    // Convert the result to a Date object for comparison
    const moveInDate = new Date(
      moveInGregorian.year,
      moveInGregorian.month - 1,
      moveInGregorian.day,
    );

    // Validate the created date
    if (isNaN(moveInDate.getTime())) {
      console.error("Invalid Date created:", moveInDate);
      return null;
    }

    console.log("   Move-in Date object:", moveInDate);

    // Start from the current month and find the next due date
    let checkDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    console.log("   Starting check from:", checkDate);

    // Check up to 12 months ahead
    for (let i = 0; i < 12; i++) {
      const testDate = new Date(
        checkDate.getFullYear(),
        checkDate.getMonth() + i,
        1,
      );
      console.log(
        `   Checking month ${i}: ${testDate} (compare with move-in: ${moveInDate})`,
      );

      // If this date is on or after move-in date, it's a potential due date
      if (testDate >= moveInDate) {
        console.log("✅ Found next due date:", testDate);
        return testDate;
      }
    }

    console.log("❌ No due date found within 12 months");
    return null;
  } catch (error) {
    console.error("Error in getNextRentDueDate:", error);
    return null;
  }
}

// Helper function to get owner's Telegram user ID from token storage
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

// Helper function to get user's language preference
async function getUserLanguage(userId: string): Promise<string> {
  try {
    // Try to get language from global settings first
    const SETTINGS_FILE = join(process.cwd(), "global-settings.json");
    if (existsSync(SETTINGS_FILE)) {
      const data = readFileSync(SETTINGS_FILE, "utf-8");
      const settings = JSON.parse(data);
      if (settings.language) {
        return settings.language;
      }
    }

    // Fallback to telegram-languages.json
    const LANG_FILE = join(process.cwd(), "telegram-languages.json");
    if (existsSync(LANG_FILE)) {
      const data = readFileSync(LANG_FILE, "utf-8");
      const languages = JSON.parse(data);
      return languages[userId] || "en";
    }
  } catch (error) {
    console.error("Error getting user language:", error);
  }

  return "en"; // Default to English
}
