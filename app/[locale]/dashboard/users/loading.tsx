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

      {/* Controls Bar (Tabs & Action Placeholders) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Users Table Skeleton */}
      <div className="overflow-hidden rounded-lg border bg-card">
        {/* Table Header */}
        <div className="flex h-10 items-center justify-between border-b bg-muted/40 px-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="hidden h-4 w-28 sm:block" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-14 items-center justify-between border-b px-4 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-7 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-2.5 w-36 rounded-md" />
              </div>
            </div>
            <Skeleton className="hidden h-3.5 w-24 sm:block" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="size-7 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
