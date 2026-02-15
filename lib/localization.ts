// Localization constants for multiple language support
export const ETHIOPIAN_MONTHS = {
  en: [
    "Meskerem",
    "Tikimt",
    "Hidar",
    "Tahsas",
    "Yekatit",
    "Megabit",
    "Miyazya",
    "Ginbot",
    "Senie",
    "Hamle",
    "Nehase",
  ] as const,
  am: [
    "መስከረም",
    "ጥቅምት",
    "ኅዳር",
    "ታኅሣሥ",
    "የካቲት",
    "መጋቢት",
    "ሚያዝያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
  ] as const,
} as const;

export const ETHIOPIAN_WEEKDAYS = {
  en: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ] as const,
  am: ["ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ", "እሑድ"] as const,
} as const;

export const UI_TEXTS = {
  en: {
    renterRoom: "RENTER / ROOM",
    year: "YEAR",
    room: "ROOM",
    paid: "PAID",
    vacant: "VACANT",
    previous3: "← Previous 3",
    next3: "Next 3 →",
    moveToToday: "Move to Today",
  },
  am: {
    renterRoom: "ተከራይ / ክፍል",
    year: "ዓመት",
    room: "ክፍል",
    paid: "ተከፈለ",
    vacant: "ባዶ",
    previous3: "← ቀደም 3 ወር",
    next3: "ይቀጥል 3 ወር →",
    moveToToday: "ወደ ዛሬ ይድረስ",
  },
} as const;

// Renter names in different languages
export const RENTER_NAMES = {
  en: {
    t1: "Alex Johnson",
    t2: "Maria Garcia",
    t3: "Johnathan Doe",
  },
  am: {
    t1: "አለክስ ጆንሰን",
    t2: "ማሪያ ጋርሺያ",
    t3: "ጆናታን ዶ",
  },
} as const;

// Room names in different languages
export const ROOM_NAMES = {
  en: {
    r101: "ROOM 1",
    r102: "ROOM 2",
    r103: "ROOM 3",
  },
  am: {
    r101: "ክፍል 1",
    r102: "ክፍል 2",
    r103: "ክፍል 3",
  },
} as const;

// Language display info
export const LANGUAGE_INFO = {
  en: {
    name: "English",
    flag: "🇺🇸",
  },
  am: {
    name: "አማርኛ",
    flag: "🇪🇹",
  },
} as const;

export type Language = keyof typeof ETHIOPIAN_MONTHS;

// Default language
export const DEFAULT_LANGUAGE: Language = "en";

// Helper function to get localized text
export function getLocalizedText<T extends keyof (typeof UI_TEXTS)[Language]>(
  key: T,
  language: Language = DEFAULT_LANGUAGE,
): string {
  return UI_TEXTS[language][key];
}

// Helper function to get localized months
export function getLocalizedMonths(language: Language = DEFAULT_LANGUAGE) {
  return ETHIOPIAN_MONTHS[language];
}

// Helper function to get localized renter name
export function getLocalizedRenterName(
  renterId: string,
  language: Language = DEFAULT_LANGUAGE,
): string {
  return (
    RENTER_NAMES[language][renterId as keyof (typeof RENTER_NAMES)[Language]] ||
    RENTER_NAMES.en[renterId as keyof typeof RENTER_NAMES.en] ||
    ""
  );
}

// Helper function to get localized room name
export function getLocalizedRoomName(
  roomId: string,
  language: Language = DEFAULT_LANGUAGE,
): string {
  return (
    ROOM_NAMES[language][roomId as keyof (typeof ROOM_NAMES)[Language]] ||
    ROOM_NAMES.en[roomId as keyof typeof ROOM_NAMES.en] ||
    ""
  );
}

// Helper function to get localized weekdays
export function getLocalizedWeekdays(language: Language = DEFAULT_LANGUAGE) {
  return ETHIOPIAN_WEEKDAYS[language];
}
