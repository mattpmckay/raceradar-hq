export function EventsSectionSkeleton() {
  return (
    <section className="relative pb-24 pt-4">
      <div className="container-page space-y-16">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            {/* Row header */}
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="mb-1.5 h-3 w-14 animate-pulse rounded bg-wire" />
                <div className="h-8 w-44 animate-pulse rounded-lg bg-wire" />
              </div>
              <div className="hidden h-5 w-16 animate-pulse rounded bg-wire sm:block" />
            </div>
            {/* Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex flex-col gap-5 rounded-2xl border border-wire bg-panel p-6">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-wire" />
                    <div className="space-y-1 text-right">
                      <div className="h-7 w-8 animate-pulse rounded bg-wire" />
                      <div className="h-3 w-16 animate-pulse rounded bg-wire" />
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
        ))}
      </div>
    </section>
  )
}
