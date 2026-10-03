import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-6 w-44 rounded-md sm:h-7" />
          </div>
          <Skeleton className="h-3.5 w-72 max-w-full rounded-md" />
        </div>
      </div>

      {/* Form Card Skeleton */}
      <div className="space-y-6 rounded-xl border bg-card p-5 shadow-xs">
        {/* Basic Campaign Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>

        {/* Date / Time Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        {/* Active Switch Box */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3.5">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>

        {/* Selected Products Section */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>

          {/* Product Items Skeleton Rows */}
          <div className="space-y-2.5">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border bg-muted/10 p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <Skeleton className="h-9 w-full rounded-md sm:w-24" />
          <Skeleton className="h-9 w-full rounded-md sm:w-36" />
        </div>
      </div>
    </div>
  )
}
