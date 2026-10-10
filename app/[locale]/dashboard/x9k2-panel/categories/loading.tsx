import { Skeleton } from "@/components/ui/skeleton"

export default function CategoriesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-6 w-44" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Summary Cards Skeleton (4 Cards Grid) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>

      {/* Table Toolbar Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-full max-w-xs rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>

      {/* Table Shell Skeleton */}
      <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="border-b border-border/60 bg-muted/40 p-3">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ms-auto h-4 w-10" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
