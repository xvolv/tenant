"use client";

import RentMatrixMock from "@/components/RentMatrixMock";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xl font-semibold leading-7">Rent Matrix</div>
              <div className="text-sm text-zinc-600">Showing: 2016–2021</div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                className="h-9 rounded-md bg-white px-3 text-sm font-semibold text-blue-600"
              >
                Table View
              </button>
              <button
                type="button"
                className="h-9 rounded-md px-3 text-sm font-semibold text-zinc-700"
              >
                Insights
              </button>
            </div>
          </div>

          <RentMatrixMock startYear={2016} yearsCount={6} />
        </section>
      </div>
    </div>
  );
}
