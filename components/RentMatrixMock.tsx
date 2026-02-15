"use client";

import {
  mockRooms,
  mockRenters,
  getSnapshot,
  findRenterByRoom,
  ETHIOPIAN_MONTHS,
  formatEthiopianDate,
  type Room,
  type Renter,
  type RentSnapshot,
  type RentCellStatus,
  type EthiopianMonthIndex,
} from "@/lib/mockData";
import {
  getLocalizedText,
  Language,
  DEFAULT_LANGUAGE,
  getLocalizedMonths,
  getLocalizedRenterName,
  getLocalizedRoomName,
  LANGUAGE_INFO,
} from "@/lib/localization";
import { useEffect, useRef, useState } from "react";
import { toEthiopian } from "ethiopian-calendar-new";
import RenterModal from "./RenterModal";

type Props = {
  startYear: number;
  yearsCount: number;
};

function cellClass(status: RentCellStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-800 border-emerald-100 relative overflow-hidden";
    case "vacant":
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
    default:
      return "bg-white text-zinc-400 border-zinc-200";
  }
}

function cellLabel(
  status: RentCellStatus,
  paidDate?: string,
  language: Language = DEFAULT_LANGUAGE,
) {
  switch (status) {
    case "paid":
      return `${paidDate ?? ""}✅`;
    case "vacant":
      return getLocalizedText("vacant", language);
    default:
      return "";
  }
}

export default function RentMatrixMock({ startYear, yearsCount }: Props) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedRenter, setSelectedRenter] = useState<{
    renter: Renter;
    roomId: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Always show 2016 to 2020 (current year + 2 future years)
  const now = new Date();
  const ethiopianCurrentYear = toEthiopian(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  ).year;
  const displayYears = [2016, 2017, 2018, 2019, 2020];
  const months = getLocalizedMonths(language);
  const years = displayYears;
  const totalMonths = years.length * months.length;
  const metaColWidth = "clamp(96px, 32vw, 200px)";
  const monthMinWidth = 70;
  const gridMinWidth = 240 + 3 * monthMinWidth; // Only 3 months visible at a time

  // Use ethiopian-calendar-new library for accurate conversion
  const getCurrentEthiopianDate = () => {
    const now = new Date();
    const ethiopian = toEthiopian(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );
    return {
      year: ethiopian.year,
      monthIndex: ethiopian.month - 1, // Convert to 0-based for our array
      day: ethiopian.day,
    };
  };

  const currentEthiopianDate = getCurrentEthiopianDate();
  const currentMonthFlatIndex =
    displayYears.findIndex((y) => y === currentEthiopianDate.year) *
      months.length +
    currentEthiopianDate.monthIndex;

  const [currentPage, setCurrentPage] = useState(
    Math.floor(currentMonthFlatIndex / 3),
  );
  const totalPages = Math.ceil(totalMonths / 3);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const [visibleYear, setVisibleYear] = useState(displayYears[0]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const threeMonthWidth = 3 * monthMinWidth;
      const scrollPosition = currentPage * threeMonthWidth;
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  }, [currentPage, monthMinWidth]);

  // Sync hand scroll with page state
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      isScrolling.current = true;
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
        const threeMonthWidth = 3 * monthMinWidth;
        const newPage = Math.round(container.scrollLeft / threeMonthWidth);
        if (newPage !== currentPage && newPage >= 0 && newPage < totalPages) {
          setCurrentPage(newPage);
        }

        // Calculate visible year based on scroll position
        const scrollLeft = container.scrollLeft;
        const monthIndex = Math.floor(scrollLeft / monthMinWidth);
        const yearIndex = Math.floor(monthIndex / months.length);
        const currentYear = displayYears[yearIndex];
        if (currentYear && currentYear !== visibleYear) {
          setVisibleYear(currentYear);
        }
      }, 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [
    currentPage,
    totalPages,
    monthMinWidth,
    visibleYear,
    displayYears,
    months.length,
  ]);

  const handleNext = () => {
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  };

  const handlePrev = () => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate avatar URL using national ID
  const getAvatarUrl = (nationalId: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${nationalId}`;
  };

  // Handle room click to show renter modal
  const handleRoomClick = (room: Room) => {
    const renter = findRenterByRoom(room.id);
    if (renter) {
      setSelectedRenter({ renter, roomId: room.id });
    }
  };

  const handleToday = () => {
    const todayPage = Math.floor(currentMonthFlatIndex / 3);
    setCurrentPage(todayPage);
  };

  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Language switcher above the matrix */}
      <div className="flex justify-end px-4 py-2 border-b border-black bg-zinc-50">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-2 h-8 rounded-md bg-white border border-zinc-300 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <span>🌐</span>
            <span>{LANGUAGE_INFO[language].flag}</span>
            <span className="hidden sm:inline">
              {LANGUAGE_INFO[language].name}
            </span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showLanguageDropdown && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-zinc-200 rounded-md shadow-lg z-50">
              {Object.entries(LANGUAGE_INFO).map(([langCode, info]) => (
                <button
                  key={langCode}
                  onClick={() => {
                    setLanguage(langCode as Language);
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-zinc-50 ${
                    language === langCode
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-700"
                  }`}
                >
                  <span>{info.flag}</span>
                  <span>{info.name}</span>
                  {language === langCode && (
                    <svg
                      className="w-3 h-3 ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Current day header */}
      <div className="sticky top-0 z-40 bg-white border-b border-black px-4 py-2 text-center">
        <div className="text-sm font-semibold text-zinc-900">
          {getLocalizedMonths(language)[currentEthiopianDate.monthIndex]}{" "}
          {currentEthiopianDate.day}, {currentEthiopianDate.year}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-black">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="h-8 rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getLocalizedText("previous3", language)}
        </button>
        <button
          onClick={handleToday}
          className="h-8 rounded-md bg-blue-500 px-3 text-xs font-medium text-white hover:bg-blue-600"
        >
          {getLocalizedText("moveToToday", language)}
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className="h-8 rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {getLocalizedText("next3", language)}
        </button>
      </div>
      <div
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory relative"
        ref={scrollContainerRef}
        style={{ scrollPaddingLeft: "0px" }}
      >
        <div
          style={{
            minWidth: totalMonths * monthMinWidth + 200, // Full width for all months
            display: "grid",
            gridTemplateColumns: `${metaColWidth} repeat(${totalMonths}, minmax(${monthMinWidth}px, 1fr))`,
            scrollSnapAlign: "start",
          }}
        >
          <div className="sticky left-0 z-30 border-b border-black bg-white px-3 py-3 text-[11px] font-semibold text-blue-800 sm:px-4 sm:text-xs">
            {visibleYear}
          </div>
          {years.map((y, yearIndex) => (
            <div
              key={y}
              className={`border-b border-black px-2 py-3 text-center text-[11px] font-semibold text-zinc-700 sm:px-3 sm:text-xs ${
                yearIndex % 2 === 0 ? "bg-white" : "bg-zinc-50"
              } ${yearIndex === 0 ? "" : "border-l-4 border-l-zinc-200"}`}
              style={{ gridColumn: `span ${months.length}` }}
            >
              {y}
            </div>
          ))}

          <div className="sticky left-0 z-20 border-b border-black bg-zinc-200 px-3 py-3 text-[11px] font-semibold text-zinc-700 sm:px-4 sm:text-xs backdrop-blur-none">
            {getLocalizedText("renterRoom", language)}
          </div>
          {years.flatMap((y, yearIndex) =>
            months.map((m, monthIndex) => {
              const flatIndex = yearIndex * months.length + monthIndex;
              return (
                <div
                  key={`${y}-${m}`}
                  className={`border-b border-black px-2 py-3 text-center text-[11px] font-semibold text-zinc-500 sm:px-3 sm:text-xs ${
                    yearIndex % 2 === 0 ? "bg-white" : "bg-zinc-50"
                  } ${
                    flatIndex === currentMonthFlatIndex
                      ? "border-l-4 border-l-red-500 border-r-4 border-r-red-500"
                      : monthIndex % 3 === 0
                        ? "border-l-2 border-l-zinc-300"
                        : ""
                  }`}
                >
                  {m}
                </div>
              );
            }),
          )}

          {mockRooms.map((room) => {
            const renter = findRenterByRoom(room.id);
            return (
              <div key={room.id} style={{ display: "contents" }}>
                <div
                  key={`${room.id}-meta`}
                  className="sticky left-0 z-30 border-b border-black bg-zinc-200 px-3 py-3 sm:px-4 sm:py-4 backdrop-blur-none cursor-pointer hover:bg-zinc-300 transition-colors"
                  onClick={() => handleRoomClick(room)}
                >
                  {/* Grid Layout: 2 columns, 2 rows */}
                  <div className="grid grid-cols-[auto_1fr] grid-rows-2 gap-x-2 gap-y-1">
                    {/* Avatar - Top Left */}
                    {renter && (
                      <div className="row-span-2 flex items-start justify-center">
                        <div className="relative flex-shrink-0">
                          <img
                            src={getAvatarUrl(renter.nationalId)}
                            alt={getLocalizedRenterName(renter.id, language)}
                            className="w-6 h-6 rounded-full object-cover border border-zinc-300"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                        </div>
                      </div>
                    )}

                    {/* Renter Name - Top Right */}
                    <div className="flex items-center">
                      {renter && (
                        <div className="text-[11px] font-medium text-zinc-900 sm:text-xs">
                          {getLocalizedRenterName(renter.id, language)}
                        </div>
                      )}
                    </div>

                    {/* Room Name - Bottom Left (if no renter) or Empty */}
                    {!renter && (
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-zinc-900">
                          {getLocalizedRoomName(room.id, language)}
                        </div>
                      </div>
                    )}

                    {/* Move-in Date - Bottom Right (spans full width if no avatar) */}
                    <div
                      className={`flex items-end ${!renter ? "col-span-2" : ""} mb-2`}
                    >
                      <div className="truncate text-xs font-bold text-zinc-700">
                        {renter ? (
                          renter.moveIn ? (
                            formatEthiopianDate(renter.moveIn, language)
                          ) : (
                            ""
                          )
                        ) : (
                          <div className="text-sm font-semibold text-zinc-900">
                            {getLocalizedRoomName(room.id, language)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {years.flatMap((y, yearIndex) =>
                  months.map((_, monthIndex) => {
                    const flatIndex = yearIndex * months.length + monthIndex;
                    const snap = getSnapshot(
                      room.id,
                      y,
                      monthIndex as EthiopianMonthIndex,
                    );
                    const status = snap?.status ?? "na";
                    return (
                      <div
                        key={`${room.id}-${y}-${monthIndex}`}
                        className={`border-b border-black px-2 py-2 ${
                          flatIndex === currentMonthFlatIndex
                            ? "border-l-4 border-l-red-500 border-r-4 border-r-red-500"
                            : monthIndex % 3 === 0
                              ? "border-l-2 border-l-zinc-300"
                              : ""
                        }`}
                      >
                        <div
                          className={`relative flex h-16 items-center justify-center rounded-lg border text-[11px] font-semibold ${cellClass(
                            status,
                          )}`}
                          title={snap?.note ?? ""}
                        >
                          {status === "paid" && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                              <svg
                                className="h-8 w-8 text-emerald-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                          {renter?.moveIn && (
                            <span className="absolute top-0 right-0 text-[9px] text-zinc-600 px-1 z-10">
                              {renter.moveIn.day}
                            </span>
                          )}
                          {status !== "paid" &&
                            cellLabel(status, snap?.paidDate, language) !==
                              "" && (
                              <span className="text-center">
                                {cellLabel(status, snap?.paidDate, language)}
                              </span>
                            )}
                        </div>
                      </div>
                    );
                  }),
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Renter Modal */}
      {selectedRenter && (
        <RenterModal
          renter={selectedRenter.renter}
          roomName={getLocalizedRoomName(selectedRenter.roomId, language)}
          roomId={selectedRenter.roomId}
          language={language}
          onClose={() => setSelectedRenter(null)}
        />
      )}
    </div>
  );
}
