"use client";

import { Renter } from "@/lib/mockData";
import {
  getLocalizedRenterName,
  getLocalizedRoomName,
  getLocalizedMonths,
  Language,
} from "@/lib/localization";
import { useState } from "react";

type Props = {
  renter: Renter | null;
  roomName: string;
  roomId: string;
  language: Language;
  onClose: () => void;
  onDelete: (renterId: string, roomId: string) => void;
  onUpdate: (updated: Renter) => void;
};

export default function RenterModal({
  renter,
  roomName,
  roomId,
  language,
  onClose,
  onDelete,
  onUpdate,
}: Props) {
  if (!renter) return null;

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState(renter.fullName);
  const [editPhone, setEditPhone] = useState(renter.phone);
  const [editNationalId, setEditNationalId] = useState(renter.nationalId);
  const [editMoveInYear, setEditMoveInYear] = useState(renter.moveIn.year);
  const [editMoveInMonth, setEditMoveInMonth] = useState(
    renter.moveIn.monthIndex,
  );
  const [editMoveInDay, setEditMoveInDay] = useState(String(renter.moveIn.day));
  const [editMonthPickerOpen, setEditMonthPickerOpen] = useState(false);

  const months = getLocalizedMonths(language);

  // Generate avatar URL using national ID
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${renter.nationalId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="mx-4 max-w-md w-full bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">
            {getLocalizedRoomName(roomId, language)}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={
                  getLocalizedRenterName(renter.id, language) || renter.fullName
                }
                className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              {!editOpen ? (
                <div className="text-lg font-semibold text-zinc-900">
                  {getLocalizedRenterName(renter.id, language) ||
                    renter.fullName}
                </div>
              ) : (
                <input
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              )}
              <div className="text-sm text-zinc-500">{roomName}</div>
            </div>
          </div>

          {/* National ID */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              National ID
            </label>
            {!editOpen ? (
              <div className="text-lg text-zinc-900 font-mono">
                {renter.nationalId}
              </div>
            ) : (
              <input
                value={editNationalId}
                onChange={(e) => setEditNationalId(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Phone Number
            </label>
            {!editOpen ? (
              <div className="text-lg text-zinc-900">{renter.phone}</div>
            ) : (
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            )}
          </div>

          {/* Move-in Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Move-in Date
            </label>
            {!editOpen ? (
              <div className="text-lg text-zinc-900">
                {require("@/lib/mockData").formatEthiopianDate(
                  renter.moveIn,
                  language,
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editMoveInYear}
                    onChange={(e) => setEditMoveInYear(Number(e.target.value))}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={editMoveInDay}
                    onChange={(e) => setEditMoveInDay(e.target.value)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEditMonthPickerOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                  >
                    <span>{months[editMoveInMonth] ?? ""}</span>
                    <span className="text-zinc-400">▾</span>
                  </button>

                  {editMonthPickerOpen && (
                    <div className="absolute left-0 right-0 mt-1 rounded-md border border-zinc-200 bg-white p-2 shadow-lg z-50">
                      <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-md border border-zinc-200">
                        {months.map((m, idx) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setEditMoveInMonth(idx as any);
                              setEditMonthPickerOpen(false);
                            }}
                            className={`border border-zinc-200 px-2 py-2 text-left text-xs font-medium hover:bg-zinc-50 ${
                              idx === editMoveInMonth
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
            )}
          </div>

          {/* Move-out Date (if exists) */}
          {renter.moveOut && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Move-out Date
              </label>
              <div className="text-lg text-zinc-900">
                {require("@/lib/mockData").formatEthiopianDate(
                  renter.moveOut,
                  language,
                )}
              </div>
            </div>
          )}

          {/* Room ID */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Room ID
            </label>
            <div className="text-lg text-zinc-900">{roomId}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-zinc-200 bg-zinc-50">
          {!editOpen ? (
            <>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                {language === "en" ? "Delete" : "ሰርዝ"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditOpen(true);
                  setEditFullName(renter.fullName);
                  setEditPhone(renter.phone);
                  setEditNationalId(renter.nationalId);
                  setEditMoveInYear(renter.moveIn.year);
                  setEditMoveInMonth(renter.moveIn.monthIndex);
                  setEditMoveInDay(String(renter.moveIn.day));
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {language === "en" ? "Edit" : "አርም"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditOpen(false);
                  setEditFullName(renter.fullName);
                  setEditPhone(renter.phone);
                  setEditNationalId(renter.nationalId);
                  setEditMoveInYear(renter.moveIn.year);
                  setEditMoveInMonth(renter.moveIn.monthIndex);
                  setEditMoveInDay(String(renter.moveIn.day));
                  setEditMonthPickerOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
              >
                {language === "en" ? "Cancel" : "ይቅር"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const fullName = editFullName.trim();
                  const phone = editPhone.trim();
                  const nationalId = editNationalId.trim();
                  const moveInDay = Number(editMoveInDay);
                  if (!fullName || !phone || !nationalId) return;
                  if (
                    !Number.isFinite(moveInDay) ||
                    moveInDay < 1 ||
                    moveInDay > 30
                  )
                    return;

                  onUpdate({
                    ...renter,
                    fullName,
                    phone,
                    nationalId,
                    moveIn: {
                      year: Number(editMoveInYear),
                      monthIndex: editMoveInMonth,
                      day: moveInDay,
                    },
                  });
                  setEditOpen(false);
                  setEditMonthPickerOpen(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {language === "en" ? "Save" : "አስቀምጥ"}
              </button>
            </>
          )}
        </div>

        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-5 shadow-xl border border-zinc-200">
              <div className="text-sm font-semibold text-zinc-900">
                {language === "en" ? "Delete renter" : "ተከራይ ማጥፋት"}
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                {language === "en"
                  ? "Are you sure you want to delete this renter?"
                  : "ይህን ተከራይ በትክክል ማጥፋት ይፈልጋሉ?"}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  {language === "en" ? "Cancel" : "ይቅር"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(renter.id, roomId)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  {language === "en" ? "Confirm" : "አረጋግጥ"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
