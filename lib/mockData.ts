export type EthiopianMonthIndex = number; // 0..11

export type RentCellStatus = "paid" | "partial" | "overdue" | "vacant" | "na";

export type Room = {
  id: string;
  roomNo: string;
};

export type Renter = {
  id: string;
  fullName: string;
  phone: string;
  roomId: string;
  moveIn: { year: number; monthIndex: EthiopianMonthIndex; day: number };
  moveOut?: { year: number; monthIndex: EthiopianMonthIndex; day: number };
};

export type RentSnapshot = {
  roomId: string;
  year: number;
  monthIndex: EthiopianMonthIndex;
  status: RentCellStatus;
  paidDate?: string;
  note?: string;
};

export const ETHIOPIAN_MONTHS = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
] as const;

const ETHIOPIAN_WEEKDAYS = [
  "ሰኞ",
  "ማክሰኞ",
  "ረቡዕ",
  "ሐሙስ",
  "አርብ",
  "ቅዳሜ",
  "እሑድ",
] as const;

export const mockRooms: Room[] = [
  { id: "r101", roomNo: "ROOM 1" },
  { id: "r102", roomNo: "ROOM 2" },
  { id: "r103", roomNo: "ROOM 3" },
  { id: "r104", roomNo: "ROOM 4" },
];

export const mockRenters: Renter[] = [
  {
    id: "t1",
    fullName: "Alex Johnson",
    phone: "+251 91 234 5678",
    roomId: "r101",
    moveIn: { year: 2016, monthIndex: 4, day: 15 },
  },
  {
    id: "t2",
    fullName: "Maria Garcia",
    phone: "+251 92 345 6789",
    roomId: "r102",
    moveIn: { year: 2016, monthIndex: 6, day: 1 },
  },
  {
    id: "t3",
    fullName: "Johnathan Doe",
    phone: "+251 93 456 7890",
    roomId: "r103",
    moveIn: { year: 2016, monthIndex: 5, day: 10 },
    moveOut: { year: 2016, monthIndex: 9, day: 30 },
  },
];

export const mockSnapshots: RentSnapshot[] = [
  { roomId: "r101", year: 2016, monthIndex: 4, status: "paid", paidDate: "15" },
  { roomId: "r101", year: 2016, monthIndex: 5, status: "paid", paidDate: "15" },
  { roomId: "r101", year: 2016, monthIndex: 6, status: "paid", paidDate: "15" },
  {
    roomId: "r101",
    year: 2016,
    monthIndex: 7,
    status: "partial",
    paidDate: "20",
    note: "Half paid",
  },
  {
    roomId: "r101",
    year: 2016,
    monthIndex: 8,
    status: "overdue",
    note: "Late",
  },
  { roomId: "r101", year: 2016, monthIndex: 9, status: "paid", paidDate: "18" },

  { roomId: "r102", year: 2016, monthIndex: 4, status: "vacant" },
  { roomId: "r102", year: 2016, monthIndex: 5, status: "vacant" },
  { roomId: "r102", year: 2016, monthIndex: 6, status: "paid", paidDate: "01" },
  { roomId: "r102", year: 2016, monthIndex: 7, status: "paid", paidDate: "01" },
  { roomId: "r102", year: 2016, monthIndex: 8, status: "paid", paidDate: "01" },
  {
    roomId: "r102",
    year: 2016,
    monthIndex: 9,
    status: "overdue",
    note: "Agreed late date",
  },

  { roomId: "r103", year: 2016, monthIndex: 4, status: "vacant" },
  { roomId: "r103", year: 2016, monthIndex: 5, status: "paid", paidDate: "10" },
  { roomId: "r103", year: 2016, monthIndex: 6, status: "paid", paidDate: "10" },
  { roomId: "r103", year: 2016, monthIndex: 7, status: "paid", paidDate: "10" },
  {
    roomId: "r103",
    year: 2016,
    monthIndex: 8,
    status: "partial",
    paidDate: "14",
    note: "Partial",
  },
  { roomId: "r103", year: 2016, monthIndex: 9, status: "vacant" },

  { roomId: "r104", year: 2016, monthIndex: 4, status: "vacant" },
  { roomId: "r104", year: 2016, monthIndex: 5, status: "vacant" },
  { roomId: "r104", year: 2016, monthIndex: 6, status: "vacant" },
  { roomId: "r104", year: 2016, monthIndex: 7, status: "vacant" },
  { roomId: "r104", year: 2016, monthIndex: 8, status: "vacant" },
  { roomId: "r104", year: 2016, monthIndex: 9, status: "vacant" },
];

export function findRenterByRoom(roomId: string) {
  return mockRenters.find((r) => r.roomId === roomId);
}

export function getSnapshot(
  roomId: string,
  year: number,
  monthIndex: EthiopianMonthIndex,
): RentSnapshot | undefined {
  return mockSnapshots.find(
    (s) =>
      s.roomId === roomId && s.year === year && s.monthIndex === monthIndex,
  );
}

export function formatEthiopianDate(input: {
  year: number;
  monthIndex: EthiopianMonthIndex;
  day: number;
}) {
  const month = ETHIOPIAN_MONTHS[input.monthIndex] ?? "";
  const weekday = ETHIOPIAN_WEEKDAYS[input.day % 7] ?? "";
  return `${month} ${input.day} ${weekday}`;
}
