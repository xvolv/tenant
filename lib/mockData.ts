import {
  Language,
  DEFAULT_LANGUAGE,
  getLocalizedMonths,
  getLocalizedWeekdays,
} from "./localization";

export type EthiopianMonthIndex = number; // 0..11

export type RentCellStatus = "paid" | "vacant" | "na";

export type Room = {
  id: string;
  roomNo: string;
};

export type Renter = {
  id: string;
  fullName: string;
  phone: string;
  roomId: string;
  nationalId: string;
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

// Export localized months for backward compatibility
export const ETHIOPIAN_MONTHS = getLocalizedMonths(DEFAULT_LANGUAGE);
export const ETHIOPIAN_WEEKDAYS = getLocalizedWeekdays(DEFAULT_LANGUAGE);

export const mockRooms: Room[] = [
  { id: "r101", roomNo: "ROOM 1" },
  { id: "r102", roomNo: "ROOM 2" },
  { id: "r103", roomNo: "ROOM 3" },
];

export const mockRenters: Renter[] = [
  {
    id: "t1",
    fullName: "Alex Johnson",
    phone: "+251 91 234 5678",
    roomId: "r101",
    nationalId: "ETH123456",
    moveIn: { year: 2016, monthIndex: 4, day: 15 }, // Tahsas 15, 2016
  },
  {
    id: "t2",
    fullName: "Maria Garcia",
    phone: "+251 92 345 6789",
    roomId: "r102",
    nationalId: "ETH789012",
    moveIn: { year: 2017, monthIndex: 6, day: 1 }, // Yekatit 1, 2017
  },
  {
    id: "t3",
    fullName: "Johnathan Doe",
    phone: "+251 93 456 7890",
    roomId: "r103",
    nationalId: "ETH345678",
    moveIn: { year: 2017, monthIndex: 5, day: 10 }, // Tahsas 10, 2017
  },
];

export const mockSnapshots: RentSnapshot[] = [
  // Room 1 (Alex) - moved in Tahsas 15, 2016, pays starting from Yekatit 2016
  { roomId: "r101", year: 2016, monthIndex: 5, status: "paid", paidDate: "15" }, // Yekatit 2016
  { roomId: "r101", year: 2016, monthIndex: 6, status: "paid", paidDate: "15" }, // Megabit 2016
  { roomId: "r101", year: 2016, monthIndex: 7, status: "paid", paidDate: "15" }, // Miyazya 2016
  { roomId: "r101", year: 2016, monthIndex: 8, status: "paid", paidDate: "15" }, // Ginbot 2016
  { roomId: "r101", year: 2016, monthIndex: 9, status: "paid", paidDate: "15" }, // Senie 2016
  {
    roomId: "r101",
    year: 2016,
    monthIndex: 10,
    status: "paid",
    paidDate: "15",
  }, // Hamle 2016
  {
    roomId: "r101",
    year: 2016,
    monthIndex: 11,
    status: "paid",
    paidDate: "15",
  }, // Nehase 2016
  {
    roomId: "r101",
    year: 2016,
    monthIndex: 12,
    status: "paid",
    paidDate: "15",
  }, // Pagume 2016
  { roomId: "r101", year: 2017, monthIndex: 0, status: "paid", paidDate: "15" }, // Meskerem 2017
  { roomId: "r101", year: 2017, monthIndex: 1, status: "paid", paidDate: "15" }, // Tikimt 2017
  { roomId: "r101", year: 2017, monthIndex: 2, status: "paid", paidDate: "15" }, // Hidar 2017
  { roomId: "r101", year: 2017, monthIndex: 3, status: "paid", paidDate: "15" }, // Tahsas 2017
  { roomId: "r101", year: 2017, monthIndex: 4, status: "paid", paidDate: "15" }, // Tahsas 2017
  { roomId: "r101", year: 2017, monthIndex: 5, status: "paid", paidDate: "15" }, // Yekatit 2017
  { roomId: "r101", year: 2017, monthIndex: 6, status: "paid", paidDate: "15" }, // Megabit 2017
  { roomId: "r101", year: 2017, monthIndex: 7, status: "paid", paidDate: "15" }, // Miyazya 2017
  { roomId: "r101", year: 2017, monthIndex: 8, status: "paid", paidDate: "15" }, // Ginbot 2017
  { roomId: "r101", year: 2017, monthIndex: 9, status: "paid", paidDate: "15" }, // Senie 2017
  {
    roomId: "r101",
    year: 2017,
    monthIndex: 10,
    status: "paid",
    paidDate: "15",
  }, // Hamle 2017
  {
    roomId: "r101",
    year: 2017,
    monthIndex: 11,
    status: "paid",
    paidDate: "15",
  }, // Nehase 2017
  {
    roomId: "r101",
    year: 2017,
    monthIndex: 12,
    status: "paid",
    paidDate: "15",
  }, // Pagume 2017
  { roomId: "r101", year: 2018, monthIndex: 0, status: "paid", paidDate: "15" }, // Meskerem 2018
  { roomId: "r101", year: 2018, monthIndex: 1, status: "paid", paidDate: "15" }, // Tikimt 2018
  { roomId: "r101", year: 2018, monthIndex: 2, status: "paid", paidDate: "15" }, // Hidar 2018
  { roomId: "r101", year: 2018, monthIndex: 3, status: "paid", paidDate: "15" }, // Tahsas 2018
  { roomId: "r101", year: 2018, monthIndex: 4, status: "paid", paidDate: "15" }, // Tahsas 2018
  { roomId: "r101", year: 2018, monthIndex: 5, status: "na" }, // Today Yekatit 8 - waiting for 15th

  // Room 2 (Maria) - moved in Yekatit 1, 2017, pays starting from Megabit 2017
  { roomId: "r102", year: 2017, monthIndex: 6, status: "paid", paidDate: "01" }, // Megabit 2017
  { roomId: "r102", year: 2017, monthIndex: 7, status: "paid", paidDate: "01" }, // Miyazya 2017
  { roomId: "r102", year: 2017, monthIndex: 8, status: "paid", paidDate: "01" }, // Ginbot 2017
  { roomId: "r102", year: 2017, monthIndex: 9, status: "paid", paidDate: "01" }, // Senie 2017
  {
    roomId: "r102",
    year: 2017,
    monthIndex: 10,
    status: "paid",
    paidDate: "01",
  }, // Hamle 2017
  {
    roomId: "r102",
    year: 2017,
    monthIndex: 11,
    status: "paid",
    paidDate: "01",
  }, // Nehase 2017
  { roomId: "r102", year: 2018, monthIndex: 0, status: "paid", paidDate: "01" }, // Meskerem 2018
  { roomId: "r102", year: 2018, monthIndex: 1, status: "paid", paidDate: "01" }, // Tikimt 2018
  { roomId: "r102", year: 2018, monthIndex: 2, status: "paid", paidDate: "01" }, // Hidar 2018
  { roomId: "r102", year: 2018, monthIndex: 3, status: "paid", paidDate: "01" }, // Tahsas 2018
  { roomId: "r102", year: 2018, monthIndex: 4, status: "paid", paidDate: "01" }, // Tahsas 2018
  { roomId: "r102", year: 2018, monthIndex: 5, status: "paid", paidDate: "01" }, // Yekatit 2018 - paid on 1st

  // Room 3 (Johnathan) - moved in Tahsas 10, 2017, pays starting from Yekatit 2017
  { roomId: "r103", year: 2017, monthIndex: 5, status: "paid", paidDate: "10" }, // Yekatit 2017 - first payment month
  { roomId: "r103", year: 2017, monthIndex: 6, status: "paid", paidDate: "10" }, // Megabit 2017
  { roomId: "r103", year: 2017, monthIndex: 7, status: "paid", paidDate: "10" }, // Miyazya 2017
  { roomId: "r103", year: 2017, monthIndex: 8, status: "paid", paidDate: "10" }, // Ginbot 2017
  { roomId: "r103", year: 2017, monthIndex: 9, status: "paid", paidDate: "10" }, // Senie 2017
  {
    roomId: "r103",
    year: 2017,
    monthIndex: 10,
    status: "paid",
    paidDate: "10",
  }, // Hamle 2017
  {
    roomId: "r103",
    year: 2017,
    monthIndex: 11,
    status: "paid",
    paidDate: "10",
  }, // Nehase 2017
  { roomId: "r103", year: 2018, monthIndex: 0, status: "paid", paidDate: "10" }, // Meskerem 2018
  { roomId: "r103", year: 2018, monthIndex: 1, status: "paid", paidDate: "10" }, // Tikimt 2018
  { roomId: "r103", year: 2018, monthIndex: 2, status: "paid", paidDate: "10" }, // Hidar 2018
  { roomId: "r103", year: 2018, monthIndex: 3, status: "paid", paidDate: "10" }, // Tahsas 2018
  { roomId: "r103", year: 2018, monthIndex: 4, status: "paid", paidDate: "10" }, // Tahsas 2018
  { roomId: "r103", year: 2018, monthIndex: 5, status: "na" }, // Today Yekatit 8 - waiting for 10th
];

export function findRenterByRoom(roomId: string) {
  return mockRenters.find((r) => r.roomId === roomId);
}

export function getSnapshot(
  roomId: string,
  year: number,
  monthIndex: EthiopianMonthIndex,
): RentSnapshot | undefined {
  // First check if there's an explicit snapshot
  const explicitSnapshot = mockSnapshots.find(
    (s) =>
      s.roomId === roomId && s.year === year && s.monthIndex === monthIndex,
  );

  if (explicitSnapshot) {
    return explicitSnapshot;
  }

  // If no explicit snapshot, check if room should be vacant before move-in
  const renter = findRenterByRoom(roomId);
  if (renter) {
    const moveInDate = new Date(
      renter.moveIn.year,
      renter.moveIn.monthIndex,
      renter.moveIn.day,
    );
    const currentDate = new Date(year, monthIndex, 1);

    // If current month is before move-in month, mark as vacant
    if (currentDate < moveInDate) {
      return {
        roomId,
        year,
        monthIndex,
        status: "vacant",
      };
    }
  }

  // Default to na if no other condition matches
  return {
    roomId,
    year,
    monthIndex,
    status: "na",
  };
}

export function formatEthiopianDate(
  input: {
    year: number;
    monthIndex: EthiopianMonthIndex;
    day: number;
  },
  language: Language = DEFAULT_LANGUAGE,
) {
  const months = getLocalizedMonths(language);
  const weekdays = getLocalizedWeekdays(language);
  const month = months[input.monthIndex] ?? "";
  const weekday = weekdays[input.day % 7] ?? "";
  return `${month} ${input.day} ${weekday}`;
}
