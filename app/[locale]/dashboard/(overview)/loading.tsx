import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="border-b border-border/40 pb-3">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="mt-1 h-4 w-64 max-w-full rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <Skeleton className="h-4 w-32 max-w-full rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>

      <div className="flex min-h-100 flex-1 items-center justify-center rounded-xl border border-border bg-card p-6 shadow-xs">
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>
    </div>
  )
}
