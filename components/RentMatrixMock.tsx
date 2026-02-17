"use client";
import Loading from "./Loading";

import {
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
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toEthiopian } from "ethiopian-calendar-new";
import RenterModal from "./RenterModal";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getRooms,
  createRoom,
  createRenter,
  updateRenter,
  deleteRenter,
  updateRentPayment,
  deleteRoom,
} from "@/lib/database-api";

type Props = {
  startYear: number;
  yearsCount: number;
  rooms: Room[];
};

function cellClass(status: RentCellStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-800 border-emerald-100 relative overflow-hidden";
    case "overdue":
      return "bg-yellow-50 text-yellow-800 border-yellow-200 relative overflow-hidden cursor-pointer hover:border-yellow-400";
    case "vacant":
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
    default:
      return "bg-white text-zinc-400 border-zinc-200 cursor-pointer hover:border-blue-400";
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
    case "overdue":
      return "⏰";
    case "vacant":
      return getLocalizedText("vacant", language);
    default:
      return "";
  }
}

export default function RentMatrixMock({
  startYear,
  yearsCount,
  rooms,
}: Props) {
  const { language } = useLanguage();
  const router = useRouter();
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(false);
  const [renterPhotoUrl, setRenterPhotoUrl] = useState<Record<string, string>>(
    {},
  );
  const [selectedRenter, setSelectedRenter] = useState<{
    renter: Renter;
    roomId: string;
  } | null>(null);

  // Derive renters from rooms prop
  useEffect(() => {
    const allRenters = rooms.flatMap((room) => room.renters);
    setRenters(allRenters);

    const fromDb: Record<string, string> = {};
    for (const r of allRenters) {
      if (r.photoUrl) {
        fromDb[r.id] = r.photoUrl;
      }
    }
    setRenterPhotoUrl((prev) => ({
      ...fromDb,
      ...prev,
    }));
  }, [rooms]);

  // State to track paid status for manual toggling
  const [paidStatuses, setPaidStatuses] = useState<Set<string>>(new Set());

  // State for payment warning modal
  const [paymentWarning, setPaymentWarning] = useState<{
    roomId: string;
    year: number;
    monthIndex: number;
    dueDate: number;
    action:
      | "mark-paid"
      | "mark-paid-normal"
      | "mark-paid-future"
      | "unmark-paid";
  } | null>(null);

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

    // Handle month indexing - remove Pagume from our array
    let monthIndex = ethiopian.month - 1; // Convert to 0-based
    if (ethiopian.month > 11) {
      // If it's Pagume (month 12), map to Nehase (index 10)
      monthIndex = 10;
    } else if (ethiopian.month > 5) {
      // Months after Yekatit (month 6) need to be shifted down by 1
      // because we removed Pagume from our array
      monthIndex = ethiopian.month - 1;
    }

    return {
      year: ethiopian.year,
      monthIndex: monthIndex,
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

  // Scroll to today on initial load with retry mechanism
  useLayoutEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const attemptScroll = () => {
      if (scrollContainerRef.current) {
        const todayPage = Math.floor(currentMonthFlatIndex / 3);
        const threeMonthWidth = 3 * monthMinWidth;
        const scrollPosition = todayPage * threeMonthWidth;

        // Check if we can actually scroll (element has scrollable content)
        if (
          scrollContainerRef.current.scrollWidth >
          scrollContainerRef.current.clientWidth
        ) {
          scrollContainerRef.current.scrollLeft = scrollPosition;
          return true; // Success
        }
      }

      attempts++;
      if (attempts < maxAttempts) {
        // Try again with increasing delays
        setTimeout(attemptScroll, 50 * attempts);
      }
      return false;
    };

    attemptScroll();
  }, [currentMonthFlatIndex, monthMinWidth]); // Add dependencies to recalculate if values change

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

  // Generate avatar URL using national ID
  const getAvatarUrl = (nationalId: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${nationalId}`;
  };

  const findRenterByRoomLocal = (roomId: string) => {
    return renters.find((r) => r.roomId === roomId);
  };

  const getSnapshotLocal = (
    roomId: string,
    year: number,
    monthIndex: EthiopianMonthIndex,
  ): RentSnapshot | undefined => {
    // Find the room and its rent payments
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return undefined;

    // Check if there's a rent payment record for this month
    const payment = room.rentPayments?.find(
      (p) => p.year === year && p.monthIndex === monthIndex,
    );

    if (payment) {
      return {
        roomId,
        year,
        monthIndex,
        status: payment.isPaid ? "paid" : "unpaid",
        paidDate: payment.isPaid
          ? new Date().toISOString().split("T")[0]
          : undefined,
      };
    }

    const renter = findRenterByRoomLocal(roomId);
    if (renter) {
      // Check if this month is before renter moved in
      const moveInDate = new Date(
        renter.moveInYear,
        renter.moveInMonth,
        renter.moveInDay,
      );
      const currentDate = new Date(year, monthIndex, 1);
      if (currentDate < moveInDate) {
        return { roomId, year, monthIndex, status: "vacant" };
      }

      // Check if renter moved out
      if (
        renter.moveOutYear !== null &&
        renter.moveOutMonth !== null &&
        renter.moveOutDay !== null
      ) {
        const moveOutDate = new Date(
          renter.moveOutYear!,
          renter.moveOutMonth!,
          renter.moveOutDay!,
        );
        const currentDate = new Date(year, monthIndex, 1);
        if (currentDate >= moveOutDate) {
          return { roomId, year, monthIndex, status: "vacant" };
        }
      }

      // Default to unpaid for occupied months
      return { roomId, year, monthIndex, status: "unpaid" };
    }

    return { roomId, year, monthIndex, status: "na" };
  };

  // Handle room click to show renter modal
  const handleRoomClick = (room: Room) => {
    const renter = findRenterByRoomLocal(room.id);
    if (renter) {
      setSelectedRenter({ renter, roomId: room.id });
    }
  };

  const handleDeleteRenter = async (renterId: string, roomId: string) => {
    try {
      await deleteRenter(renterId);
      await deleteRoom(roomId);
      setRenters((prev: any) => prev.filter((r: any) => r.id !== renterId));
      // setRooms((prev) => prev.filter((room) => room.id !== roomId));
      setRenterPhotoUrl((prev) => {
        if (!(renterId in prev)) return prev;
        const { [renterId]: _, ...rest } = prev;
        return rest;
      });
      setPaidStatuses((prev) => {
        const next = new Set<string>();
        for (const key of prev) {
          if (!key.startsWith(`${roomId}-`)) {
            next.add(key);
          }
        }
        return next;
      });
      setSelectedRenter(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete renter:", error);
    }
  };

  const handleUpdateRenter = async (updated: Renter) => {
    try {
      await updateRenter(updated.id, {
        fullName: updated.fullName,
        phone: updated.phone,
        nationalId: updated.nationalId,
        moveInYear: updated.moveInYear,
        moveInMonth: updated.moveInMonth,
        moveInDay: updated.moveInDay,
        photoUrl: updated.photoUrl,
      });
      setRenters((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      setSelectedRenter((prev) =>
        prev && prev.renter.id === updated.id
          ? { ...prev, renter: updated }
          : prev,
      );
    } catch (error) {
      console.error("Failed to update renter:", error);
    }
  };

  const handleNewRenterPhotoChange = (file: File | null) => {
    if (!file) return;
    setNewRenterPhotoFile(file);
    const url = URL.createObjectURL(file);
    setNewRenterPhotoPreviewUrl(url);
  };

  const resetAddRenterForm = () => {
    setNewRenterFullName("");
    setNewRenterPhone("");
    setNewRenterNationalId("");
    setNewRenterMoveInYear(2018);
    setNewRenterMoveInMonthIndex(0);
    setNewRenterMoveInDay("");
    setNewRenterPhotoFile(null);
    setNewRenterPhotoPreviewUrl(null);
    setAddRenterError(null);
    setMonthPickerOpen(false);
  };

  const handleAddRenterSubmit = async () => {
    const fullName = newRenterFullName.trim();
    const phone = newRenterPhone.trim();
    const nationalId = newRenterNationalId.trim();
    const moveInDay = Number(newRenterMoveInDay);
    if (!fullName || !phone || !nationalId) return;
    if (!Number.isFinite(moveInDay) || moveInDay < 1 || moveInDay > 30) return;

    setAddRenterError(null);
    try {
      let uploadedPhotoUrl: string | undefined = undefined;
      if (newRenterPhotoFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", newRenterPhotoFile);

        const uploadResp = await fetch("/api/uploads/renter-photo", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadResp.ok) {
          let details = "";
          try {
            details = await uploadResp.text();
          } catch {
            details = "";
          }
          throw new Error(
            details ? `Photo upload failed: ${details}` : "Photo upload failed",
          );
        }

        const uploadBody = (await uploadResp.json()) as { secureUrl?: string };
        if (!uploadBody.secureUrl) {
          throw new Error("Photo upload failed: missing secureUrl");
        }
        uploadedPhotoUrl = uploadBody.secureUrl;
      }

      const roomNumber = rooms.length + 1;
      const response = await fetch("/api/rooms/with-renter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: `ROOM ${roomNumber}`,
          fullName,
          phone,
          nationalId,
          moveInYear: Number(newRenterMoveInYear),
          moveInMonth: newRenterMoveInMonthIndex,
          moveInDay,
          photoUrl: uploadedPhotoUrl,
        }),
      });

      if (!response.ok) {
        let details = "";
        try {
          details = await response.text();
        } catch {
          details = "";
        }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const body = JSON.parse(details);
          setAddRenterError(body?.error ?? "Failed to create room+renter");
        } else {
          setAddRenterError(details || "Failed to create room+renter");
        }
        return;
      }

      const { room, renter } = (await response.json()) as {
        room: { id: string };
        renter: any;
      };

      setRenters((prev: any) => [...prev, renter]);
      if (uploadedPhotoUrl) {
        setRenterPhotoUrl((prev) => ({
          ...prev,
          [renter.id]: uploadedPhotoUrl,
        }));
      }

      setAddRenterOpen(false);
      resetAddRenterForm();
      router.refresh();
    } catch (error) {
      console.error("Failed to add renter:", error);
      const message =
        error instanceof Error ? error.message : "Failed to add renter";
      setAddRenterError(message);
    }
  };

  const handleToday = () => {
    const todayPage = Math.floor(currentMonthFlatIndex / 3);
    setCurrentPage(todayPage);

    // Also directly scroll to ensure it works
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const threeMonthWidth = 3 * monthMinWidth;
        const scrollPosition = todayPage * threeMonthWidth;
        scrollContainerRef.current.scrollLeft = scrollPosition;
      }
    }, 50); // Small delay to ensure the DOM has updated
  };

  // Handle cell click to toggle paid status
  const handleCellClick = (
    roomId: string,
    year: number,
    monthIndex: number,
  ) => {
    // Check if this month is in the past or current (not future)
    const cellFlatIndex =
      displayYears.findIndex((y) => y === year) * months.length + monthIndex;

    // Check if this cell is vacant (no renter during this period)
    const snap = getSnapshotLocal(
      roomId,
      year,
      monthIndex as EthiopianMonthIndex,
    );
    if (snap?.status === "vacant") {
      // Vacant cells cannot be marked as paid
      return;
    }

    // Check if it's current month and before due date (day-level enforcement)
    const isCurrentMonth = cellFlatIndex === currentMonthFlatIndex;
    const renter = findRenterByRoomLocal(roomId);

    // Check current paid status
    const cellKey = `${roomId}-${year}-${monthIndex}`;
    const isCurrentlyPaid =
      paidStatuses.has(cellKey) || snap?.status === "paid";

    const isFutureMonth = cellFlatIndex > currentMonthFlatIndex;

    if (isCurrentMonth && renter?.moveInDay && !isCurrentlyPaid) {
      const dueDate = renter.moveInDay; // Use move-in day as due date for now
      if (currentEthiopianDate.day < dueDate) {
        // Show early payment warning modal
        setPaymentWarning({
          roomId,
          year,
          monthIndex,
          dueDate,
          action: "mark-paid",
        });
        return; // Wait for user response in modal
      }
    }

    // Future month payments: allow, but always confirm
    if (isFutureMonth && !isCurrentlyPaid) {
      setPaymentWarning({
        roomId,
        year,
        monthIndex,
        dueDate: 0,
        action: "mark-paid-future",
      });
      return;
    }

    // For unmarking as paid, always show confirmation
    if (isCurrentlyPaid) {
      setPaymentWarning({
        roomId,
        year,
        monthIndex,
        dueDate: 0, // Not needed for unmark action
        action: "unmark-paid",
      });
      return; // Wait for user response in modal
    }

    // For normal marking as paid (no early payment warning needed)
    if (!isCurrentlyPaid) {
      setPaymentWarning({
        roomId,
        year,
        monthIndex,
        dueDate: 0, // Not needed for normal paid action
        action: "mark-paid-normal",
      });
      return; // Wait for user response in modal
    }
  };

  // Handle confirming payment action
  const handleConfirmPaymentAction = async () => {
    if (!paymentWarning) return;

    try {
      const isPaid = paymentWarning.action !== "unmark-paid";
      await updateRentPayment(
        paymentWarning.roomId,
        paymentWarning.year,
        paymentWarning.monthIndex,
        isPaid,
      );

      const key = `${paymentWarning.roomId}-${paymentWarning.year}-${paymentWarning.monthIndex}`;
      setPaidStatuses((prev) => {
        const newSet = new Set(prev);

        if (paymentWarning.action === "unmark-paid") {
          // Remove from paid status
          newSet.delete(key);
        } else {
          // Add to paid status (both early and normal)
          newSet.add(key);
        }

        return newSet;
      });

      // Close warning modal
      setPaymentWarning(null);
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  // Handle canceling payment action
  const handleCancelPaymentAction = () => {
    setPaymentWarning(null);
  };

  const [addRenterOpen, setAddRenterOpen] = useState(false);
  const [newRenterFullName, setNewRenterFullName] = useState("");
  const [newRenterPhone, setNewRenterPhone] = useState("");
  const [newRenterNationalId, setNewRenterNationalId] = useState("");
  const [newRenterMoveInYear, setNewRenterMoveInYear] = useState(2018);
  const [newRenterMoveInMonthIndex, setNewRenterMoveInMonthIndex] =
    useState<EthiopianMonthIndex>(0);
  const [newRenterMoveInDay, setNewRenterMoveInDay] = useState("");
  const [newRenterPhotoFile, setNewRenterPhotoFile] = useState<File | null>(
    null,
  );
  const [newRenterPhotoPreviewUrl, setNewRenterPhotoPreviewUrl] = useState<
    string | null
  >(null);
  const [addRenterError, setAddRenterError] = useState<string | null>(null);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const isAnyModalOpen = Boolean(
    selectedRenter || paymentWarning || addRenterOpen,
  );

  return (
    <div className="relative">
      {loading ? (
        <Loading />
      ) : (
        <div
          className={`mt-4 rounded-xl border border-zinc-200 bg-white shadow-sm ${
            isAnyModalOpen ? "blur-sm pointer-events-none select-none" : ""
          }`}
        >
          {/* Current day header */}
          <div className="sticky top-0 z-40 border-b border-black px-4 py-2 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url(/login-bg.png)",
                backgroundPosition: "center 35%",
              }}
            />
            <div className="absolute inset-0 bg-white/60" />
            <div className="relative text-sm font-semibold text-zinc-900 truncate">
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
                      className={`border-b border-black px-2 py-3 text-center text-[11px] font-semibold text-zinc-500 sm:px-3 sm:text-xs truncate ${
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

              {rooms.map((room) => {
                const renter = findRenterByRoomLocal(room.id);
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
                                src={
                                  renterPhotoUrl[renter.id] ??
                                  renter.photoUrl ??
                                  getAvatarUrl(renter.nationalId)
                                }
                                alt={
                                  getLocalizedRenterName(renter.id, language) ||
                                  renter.fullName
                                }
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
                              {getLocalizedRenterName(renter.id, language) ||
                                renter.fullName}
                            </div>
                          )}
                        </div>

                        {/* Room Name - Bottom Left (if no renter) or Empty */}
                        {!renter && (
                          <div className="flex items-center">
                            <div className="text-sm font-semibold text-zinc-900">
                              {room.name}
                            </div>
                          </div>
                        )}

                        {/* Move-in Date - Bottom Right (spans full width if no avatar) */}
                        <div
                          className={`flex items-end ${!renter ? "col-span-2" : ""} mb-2`}
                        >
                          <div className="truncate text-xs font-bold text-zinc-700">
                            {renter ? (
                              formatEthiopianDate(
                                {
                                  year: renter.moveInYear,
                                  monthIndex: renter.moveInMonth as any,
                                  day: renter.moveInDay,
                                },
                                language,
                              )
                            ) : (
                              <div className="text-sm font-semibold text-zinc-900">
                                {room.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {years.flatMap((y, yearIndex) =>
                      months.map((_, monthIndex) => {
                        const flatIndex =
                          yearIndex * months.length + monthIndex;
                        const snap = getSnapshotLocal(
                          room.id,
                          y,
                          monthIndex as EthiopianMonthIndex,
                        );

                        // Check if this cell is manually marked as paid
                        const cellKey = `${room.id}-${y}-${monthIndex}`;
                        const isManuallyPaid = paidStatuses.has(cellKey);

                        // Determine status: manual paid takes priority, then original status
                        let status: RentCellStatus;
                        if (isManuallyPaid) {
                          status = "paid";
                        } else if (
                          snap?.status === "paid" &&
                          !paidStatuses.has(
                            `${room.id}-${y}-${monthIndex}-unpaid`,
                          )
                        ) {
                          status = "paid";
                        } else if (
                          snap?.status === "unpaid" ||
                          snap?.status === "na"
                        ) {
                          // Check if this is an overdue payment
                          const cellFlatIndex =
                            displayYears.findIndex((year) => year === y) *
                              months.length +
                            monthIndex;
                          const isPastMonth =
                            cellFlatIndex < currentMonthFlatIndex;
                          const isCurrentMonth =
                            cellFlatIndex === currentMonthFlatIndex;
                          const renter = findRenterByRoomLocal(room.id);

                          // Get current Ethiopian day for comparison
                          const now = new Date();
                          const ethiopianToday = toEthiopian(
                            now.getFullYear(),
                            now.getMonth() + 1,
                            now.getDate(),
                          );
                          const currentDay = ethiopianToday.day;

                          // Get due day for this renter
                          const dueDay = renter?.moveInDay || 1;

                          const isOverdue =
                            isPastMonth ||
                            (isCurrentMonth && currentDay > dueDay);

                          if (isOverdue && renter) {
                            // This is a past month or current month after due date
                            status = "overdue";
                          } else {
                            status = snap?.status ?? "na";
                          }
                        } else {
                          status = snap?.status ?? "na";
                        }

                        // Check if this month is clickable (past or current) and not vacant
                        // Overdue cells should also be clickable so they can be marked as paid
                        const isClickable = snap?.status !== "vacant";

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
                              className={`relative flex h-16 items-center justify-center rounded-lg border text-[11px] font-semibold ${
                                isClickable ? "" : "cursor-default"
                              } ${cellClass(status)}`}
                              title={snap?.note ?? ""}
                              onClick={() =>
                                isClickable &&
                                handleCellClick(room.id, y, monthIndex)
                              }
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
                              {renter?.moveInDay && (
                                <span className="absolute top-0 right-0 text-[9px] text-zinc-600 px-1 z-10">
                                  {renter.moveInDay}
                                </span>
                              )}
                              {status !== "paid" &&
                                cellLabel(status, snap?.paidDate, language) !==
                                  "" && (
                                  <span className="text-center">
                                    {cellLabel(
                                      status,
                                      snap?.paidDate,
                                      language,
                                    )}
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

              <div style={{ display: "contents" }}>
                <div className="sticky left-0 z-30 border-b border-black bg-zinc-200 px-3 py-3 sm:px-4 sm:py-4 backdrop-blur-none">
                  <button
                    type="button"
                    onClick={() => setAddRenterOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <span className="text-sm">+</span>
                    <span>{language === "en" ? "Add renter" : "ተከራይ ጨምር"}</span>
                  </button>
                </div>
                {years.flatMap((y) =>
                  months.map((_, monthIndex) => (
                    <div
                      key={`add-row-${y}-${monthIndex}`}
                      className={`border-b border-black px-2 py-2 ${
                        monthIndex % 3 === 0
                          ? "border-l-2 border-l-zinc-300"
                          : ""
                      }`}
                    >
                      <div className="h-16 rounded-lg border border-zinc-200 bg-white" />
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renter Modal */}
      {selectedRenter && (
        <RenterModal
          renter={selectedRenter.renter}
          roomName={
            rooms.find((r) => r.id === selectedRenter.roomId)?.name || ""
          }
          roomId={selectedRenter.roomId}
          language={language}
          onClose={() => setSelectedRenter(null)}
          onDelete={handleDeleteRenter}
          onUpdate={handleUpdateRenter}
        />
      )}

      {/* Payment Warning Modal */}
      {paymentWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">
                {paymentWarning.action === "unmark-paid"
                  ? language === "en"
                    ? "Cancel Payment Confirmation"
                    : "ክፍያ መሰረዝ ማረጋገጫ"
                  : language === "en"
                    ? "Payment Confirmation"
                    : "ክፍያ ማረጋገጫ"}
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                {paymentWarning.action === "unmark-paid"
                  ? language === "en"
                    ? "Do you want to mark this month as unpaid?"
                    : "የዚህ ወር ክፍያ ማጥፋት ይፈልጋሉ ?"
                  : paymentWarning.action === "mark-paid-future"
                    ? language === "en"
                      ? "This is a future month. Mark as paid anyway?"
                      : "ይህ የወደፊት ወር ነው፣ ተከፍሏል ?"
                    : paymentWarning.action === "mark-paid" &&
                        paymentWarning.dueDate > 0
                      ? language === "en"
                        ? `Due date is ${paymentWarning.dueDate}. Mark as paid anyway?`
                        : `ገና ${paymentWarning.dueDate} ቀን ይቀራል፣ ተከፍሏል ?`
                      : language === "en"
                        ? "Mark this month as paid?"
                        : "ይህን ወር እንደተከፈለ መምልክ ይፈልጋሉ?"}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelPaymentAction}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              >
                {language === "en" ? "Cancel" : "ይቅር"}
              </button>
              <button
                onClick={handleConfirmPaymentAction}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {paymentWarning.action === "unmark-paid"
                  ? language === "en"
                    ? "Mark as Unpaid"
                    : "አጥፍ"
                  : language === "en"
                    ? "Mark as Paid"
                    : "ተከፍሏል"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addRenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-container mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">
                {language === "en" ? "Add renter" : "ተከራይ ጨምር"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAddRenterOpen(false);
                  resetAddRenterForm();
                }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700">
                  {language === "en" ? "Full name" : "ሙሉ ስም"}
                </label>
                <input
                  value={newRenterFullName}
                  onChange={(e) => setNewRenterFullName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    language === "en" ? "Enter full name" : "ሙሉ ስም ያስገቡ"
                  }
                  autoComplete="name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">
                  {language === "en" ? "Phone" : "ስልክ"}
                </label>
                <input
                  value={newRenterPhone}
                  onChange={(e) => setNewRenterPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    language === "en" ? "Enter phone number" : "ስልክ ቁጥር ያስገቡ"
                  }
                  autoComplete="tel"
                  type="tel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">
                  {language === "en" ? "National ID" : "መታወቂያ"}
                </label>
                <input
                  value={newRenterNationalId}
                  onChange={(e) => setNewRenterNationalId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    language === "en" ? "Enter national ID" : "መታወቂያ ያስገቡ"
                  }
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700">
                    {language === "en" ? "Year" : "አመት"}
                  </label>
                  <input
                    type="number"
                    value={newRenterMoveInYear}
                    onChange={(e) =>
                      setNewRenterMoveInYear(Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-zinc-700">
                    {language === "en" ? "Month" : "ወር"}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMonthPickerOpen((v) => !v)}
                      className="mt-1 flex w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    >
                      <span>{months[newRenterMoveInMonthIndex]}</span>
                      <span className="text-zinc-400">▾</span>
                    </button>

                    {monthPickerOpen && (
                      <div className="absolute left-0 right-0 mt-1 rounded-md border border-zinc-200 bg-white p-2 shadow-lg z-50">
                        <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-md border border-zinc-200">
                          {months.map((m, idx) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setNewRenterMoveInMonthIndex(
                                  idx as EthiopianMonthIndex,
                                );
                                setMonthPickerOpen(false);
                              }}
                              className={`border border-zinc-200 px-2 py-2 text-left text-xs font-medium hover:bg-zinc-50 ${
                                idx === newRenterMoveInMonthIndex
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-zinc-700"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700">
                    {language === "en" ? "Day" : "ቀን"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newRenterMoveInDay}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") {
                        setNewRenterMoveInDay("");
                        return;
                      }
                      if (/^\d{0,2}$/.test(v)) {
                        setNewRenterMoveInDay(v);
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">
                  {language === "en" ? "Photo" : "ፎቶ"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) =>
                    handleNewRenterPhotoChange(e.target.files?.[0] ?? null)
                  }
                  className="mt-1 w-full text-sm"
                />
                {newRenterPhotoPreviewUrl && (
                  <img
                    src={newRenterPhotoPreviewUrl}
                    alt="preview"
                    className="mt-2 h-20 w-20 rounded-md object-cover border border-zinc-200"
                  />
                )}
              </div>

              {/* Inline error message */}
              {addRenterError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-700">{addRenterError}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAddRenterOpen(false);
                  resetAddRenterForm();
                }}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {language === "en" ? "Cancel" : "ይቅር"}
              </button>
              <button
                type="button"
                onClick={handleAddRenterSubmit}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {language === "en" ? "Save" : "አስቀምጥ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
