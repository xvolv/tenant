"use client";

import {
  ETHIOPIAN_MONTHS,
  mockRooms,
  findRenterByRoom,
  getSnapshot,
  formatEthiopianDate,
  RentCellStatus,
  EthiopianMonthIndex,
} from "@/lib/mockData";
import { useEffect, useRef, useState } from "react";
import { toEthiopian } from "ethiopian-calendar-new";

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

function cellLabel(status: RentCellStatus, paidDate?: string) {
  switch (status) {
    case "paid":
      return `${paidDate ?? ""}✅`;
    case "vacant":
      return "VACANT";
    default:
      return "";
  }
}

export default function RentMatrixMock({ startYear, yearsCount }: Props) {
  const months = ETHIOPIAN_MONTHS;
  const years = Array.from({ length: yearsCount }, (_, i) => startYear + i);
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
    years.findIndex((y) => y === currentEthiopianDate.year) * months.length +
    currentEthiopianDate.monthIndex;

  const [currentPage, setCurrentPage] = useState(
    Math.floor(currentMonthFlatIndex / 3),
  );
  const totalPages = Math.ceil(totalMonths / 3);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const [visibleYear, setVisibleYear] = useState(startYear);

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
        const currentYear = years[yearIndex];
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
    years,
    months.length,
  ]);

  const handleNext = () => {
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  };

  const handlePrev = () => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  };

  const handleToday = () => {
    const todayPage = Math.floor(currentMonthFlatIndex / 3);
    setCurrentPage(todayPage);
  };

  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Current day header */}
      <div className="sticky top-0 z-40 bg-white border-b border-black px-4 py-2 text-center">
        <div className="text-sm font-semibold text-zinc-900">
          {ETHIOPIAN_MONTHS[currentEthiopianDate.monthIndex]}{" "}
          {currentEthiopianDate.day}, {currentEthiopianDate.year}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-black">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="h-8 rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous 3
        </button>
        <button
          onClick={handleToday}
          className="h-8 rounded-md bg-blue-500 px-3 text-xs font-medium text-white hover:bg-blue-600"
        >
          Move to Today
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className="h-8 rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next 3 →
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
            RENTER / ROOM
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
                  className="sticky left-0 z-30 border-b border-black bg-zinc-200 px-3 py-3 sm:px-4 sm:py-4 backdrop-blur-none"
                >
                  <div className="text-xs font-semibold text-blue-700 sm:text-sm">
                    {room.roomNo}
                  </div>
                  <div className="mt-0.5 truncate text-sm font-semibold text-zinc-900">
                    {renter?.fullName ?? "—"}
                  </div>
                  <div className="mt-1 truncate text-xs text-zinc-500">
                    {renter?.moveIn ? formatEthiopianDate(renter.moveIn) : ""}
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
                            cellLabel(status, snap?.paidDate) !== "" && (
                              <span className="text-center">
                                {cellLabel(status, snap?.paidDate)}
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
    </div>
  );
}
