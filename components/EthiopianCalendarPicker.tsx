"use client";

import { useMemo, useState } from "react";

const ETHIOPIAN_MONTHS = [
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

export type EthiopianMonthIndex = number; // 0..11

type Props = {
  value?: {
    year: number;
    monthIndex: EthiopianMonthIndex;
  };
  onChange?: (next: { year: number; monthIndex: EthiopianMonthIndex }) => void;
  minYear?: number;
  maxYear?: number;
};

export default function EthiopianCalendarPicker({
  value,
  onChange,
  minYear = 2010,
  maxYear = 2035,
}: Props) {
  const [internal, setInternal] = useState(() => ({
    year: 2016,
    monthIndex: 0,
  }));

  const state = value ?? internal;

  const monthLabel = useMemo(
    () => ETHIOPIAN_MONTHS[state.monthIndex] ?? "",
    [state.monthIndex],
  );

  function commit(next: { year: number; monthIndex: EthiopianMonthIndex }) {
    if (next.year < minYear || next.year > maxYear) return;
    if (next.monthIndex < 0 || next.monthIndex > 11) return;

    setInternal(next);
    onChange?.(next);
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3 md:justify-start">
          <div>
            <div className="text-sm font-semibold text-zinc-900">
              Ethiopian Calendar
            </div>
            <div className="text-sm text-zinc-600">
              {monthLabel} {state.year}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900"
              onClick={() => commit({ ...state, year: state.year - 1 })}
              aria-label="Previous year"
            >
              -1Y
            </button>
            <div className="min-w-16 text-center text-sm font-semibold text-zinc-900">
              {state.year}
            </div>
            <button
              type="button"
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900"
              onClick={() => commit({ ...state, year: state.year + 1 })}
              aria-label="Next year"
            >
              +1Y
            </button>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-2">
            {ETHIOPIAN_MONTHS.map((m, idx) => {
              const active = idx === state.monthIndex;
              return (
                <button
                  key={m}
                  type="button"
                  className={
                    active
                      ? "h-10 shrink-0 rounded-full bg-blue-600 px-3 text-sm font-semibold text-white"
                      : "h-10 shrink-0 rounded-full border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900"
                  }
                  onClick={() => commit({ ...state, monthIndex: idx })}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
