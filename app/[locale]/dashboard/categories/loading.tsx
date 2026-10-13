import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="space-y-2 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-7 w-40 rounded-md" />
        </div>
        <Skeleton className="h-4 w-80 max-w-full rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="mt-3 h-7 w-14 rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 min-w-0 flex-1 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="space-y-0">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="flex h-14 items-center gap-4 border-b border-border/60 px-4 last:border-0"
            >
              <Skeleton className="h-7 flex-1 rounded-md" />
              <Skeleton className="hidden h-4 w-32 sm:block" />
              <Skeleton className="hidden h-4 w-12 sm:block" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
