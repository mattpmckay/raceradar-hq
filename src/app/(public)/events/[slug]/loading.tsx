export default function Loading() {
  return (
    <div className="container-page py-10">
      {/* Back link */}
      <div className="mb-6 h-5 w-28 animate-pulse rounded bg-wire" />

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <div>
            <div className="mb-4 flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded-full bg-wire" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-wire" />
            </div>
            <div className="space-y-3">
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-wire" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-wire" />
            </div>
          </div>

          {/* About section */}
          <div className="space-y-4">
            <div className="h-7 w-40 animate-pulse rounded bg-wire" />
            <div className="space-y-2">
              {[100, 90, 95, 85].map((w, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-wire" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>

          {/* Content block */}
          <div className="rounded-xl border border-wire bg-panel p-6 space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-wire" />
            <div className="space-y-2">
              {[85, 70, 90].map((w, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-wire" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card space-y-4">
            <div className="h-5 w-28 animate-pulse rounded bg-wire" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded bg-wire" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-wire" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-wire" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-10 animate-pulse rounded-lg bg-wire" />
            <div className="h-10 animate-pulse rounded-lg bg-wire/60" />
          </div>
          <div className="card space-y-3">
            <div className="h-5 w-24 animate-pulse rounded bg-wire" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-32 animate-pulse rounded bg-wire" />
                <div className="h-4 w-24 animate-pulse rounded bg-wire" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
