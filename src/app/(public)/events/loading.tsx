export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="border-b border-wire/60 bg-gradient-to-b from-panel/40 to-transparent">
        <div className="container-page pt-10 pb-8 lg:pt-14 lg:pb-10">
          <div className="mb-7 space-y-3">
            <div className="h-10 w-56 animate-pulse rounded-xl bg-wire sm:h-12 lg:h-14" />
            <div className="h-4 w-72 animate-pulse rounded bg-wire" />
          </div>
          {/* Pill skeletons */}
          <div className="mb-6 flex gap-2 overflow-hidden">
            {[80, 64, 72, 88, 96, 68, 76, 80].map((w, i) => (
              <div
                key={i}
                className="h-8 shrink-0 animate-pulse rounded-full bg-wire"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
          {/* Filter bar skeleton */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-wire" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-wire sm:w-44" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-wire sm:w-44" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="container-page py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-5 rounded-2xl border border-wire bg-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="h-6 w-20 animate-pulse rounded-full bg-wire" />
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 animate-pulse rounded-full bg-wire" />
                  <div className="space-y-1 text-right">
                    <div className="h-7 w-8 animate-pulse rounded bg-wire" />
                    <div className="h-3 w-16 animate-pulse rounded bg-wire" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-full animate-pulse rounded bg-wire" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-wire" />
              </div>
              <div className="h-4 w-40 animate-pulse rounded bg-wire" />
              <div className="border-t border-wire" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-wire" />
                <div className="h-7 w-7 animate-pulse rounded-full bg-wire" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
