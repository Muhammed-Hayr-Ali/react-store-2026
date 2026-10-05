import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-52 rounded-md sm:h-8" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-7 w-32 rounded-md" />
      </div>

      {/* Users Table Skeleton */}
      <div className="overflow-hidden rounded-lg border bg-card">
        {/* Table Header */}
        <div className="flex h-10 items-center justify-between border-b bg-muted/40 px-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="hidden h-4 w-40 sm:block" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex h-14 items-center justify-between border-b px-4 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
            <Skeleton className="hidden h-3 w-36 sm:block" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="hidden h-5 w-14 rounded-full md:block" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
