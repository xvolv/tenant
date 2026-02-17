import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative">
      {/* Current day header skeleton */}
      <div className="sticky top-0 z-40 bg-white border-b border-black px-4 py-2 text-center">
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>

      {/* Month navigation skeleton */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-black">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md bg-blue-500" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      {/* Dashboard Table Skeleton - proper grid layout */}
      <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory relative">
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px repeat(39, minmax(80px, 1fr))",
            }}
          >
            {/* Year Header Row */}
            <div className="sticky left-0 z-30 border-b border-black bg-white px-3 py-3 text-[11px] font-semibold text-blue-800 sm:px-4 sm:text-xs">
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Year Headers - 3 years spanning 13 months each */}
            {[...Array(3)].map((_, yearIndex) => (
              <div
                key={yearIndex}
                className={`border-b border-black px-2 py-3 text-center text-[11px] font-semibold text-zinc-500 sm:px-3 sm:text-xs ${
                  yearIndex % 2 === 0 ? "bg-white" : "bg-zinc-50"
                }`}
                style={{
                  gridColumn: `span 13`,
                }}
              >
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}

            {/* Renter Room Header Row */}
            <div className="sticky left-0 z-20 border-b border-black bg-zinc-200 px-3 py-3 text-[11px] font-semibold text-zinc-700 sm:px-4 sm:text-xs backdrop-blur-none">
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Month Names Row - 39 months total */}
            {[...Array(39)].map((_, index) => (
              <div
                key={index}
                className={`border-b border-black px-2 py-3 text-center text-[11px] font-semibold text-zinc-500 sm:px-3 sm:text-xs ${
                  Math.floor(index / 13) % 2 === 0 ? "bg-white" : "bg-zinc-50"
                }`}
              >
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            ))}

            {/* Room Row Skeletons */}
            {[...Array(2)].map((_, roomIndex) => (
              <div key={roomIndex} style={{ display: "contents" }}>
                {/* Room Header */}
                <div className="sticky left-0 z-30 border-b border-black bg-zinc-200 px-3 py-3 sm:px-4 sm:py-4 backdrop-blur-none cursor-pointer hover:bg-zinc-300 transition-colors">
                  <div className="grid grid-cols-[auto_1fr] grid-rows-2 gap-x-2 gap-y-1">
                    {/* Avatar */}
                    <div className="row-span-2 flex items-start justify-center">
                      <Skeleton className="w-6 h-6 rounded-full" />
                    </div>

                    {/* Renter Name */}
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-24" />
                    </div>

                    {/* Room Name */}
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>

                {/* Month Cells */}
                {[...Array(39)].map((_, monthIndex) => (
                  <div
                    key={monthIndex}
                    className={`border-b border-black px-2 py-2 ${
                      Math.floor(monthIndex / 13) % 2 === 0
                        ? "bg-white"
                        : "bg-zinc-50"
                    }`}
                  >
                    <div className="relative flex h-16 items-center justify-center rounded-lg border">
                      <Skeleton className="h-5 w-14" />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Add Renter Row */}
            <div style={{ display: "contents" }}>
              <div className="sticky left-0 z-30 border-b border-black bg-zinc-200 px-3 py-3 sm:px-4 sm:py-4 backdrop-blur-none">
                <div className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              {[...Array(39)].map((_, index) => (
                <div
                  key={`add-${index}`}
                  className={`border-b border-black px-2 py-2 ${
                    Math.floor(index / 13) % 2 === 0 ? "bg-white" : "bg-zinc-50"
                  }`}
                >
                  <div className="relative flex h-16 items-center justify-center rounded-lg border">
                    <Skeleton className="h-5 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
