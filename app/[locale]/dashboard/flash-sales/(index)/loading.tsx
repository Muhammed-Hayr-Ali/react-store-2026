import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-36 rounded-md sm:h-8" />
          </div>
          <Skeleton className="h-4 w-72 max-w-full rounded-md" />
        </div>

        <Skeleton className="h-9 w-36 rounded-md sm:ml-auto" />
      </div>

      {/* Table Container Skeleton */}
      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-xs">
        {/* Table Filters / Search Bar Skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full rounded-md sm:w-72" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>

        {/* Table Header & Rows */}
        <div className="overflow-hidden rounded-lg border">
          {/* Header Row */}
          <div className="flex h-10 items-center justify-between border-b bg-muted/40 px-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="hidden h-4 w-28 sm:block" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>

          {/* Table Data Rows */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-14 items-center justify-between border-b px-4 last:border-0"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="hidden h-4 w-24 md:block" />
              <Skeleton className="hidden h-4 w-28 sm:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          ))}
        </div>

        {/* Table Pagination Footer Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
