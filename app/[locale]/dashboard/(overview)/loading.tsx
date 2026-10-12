import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* 3 Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-36 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="min-h-100 flex-1 space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
