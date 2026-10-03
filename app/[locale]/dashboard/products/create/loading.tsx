import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-2 py-4 md:px-4 md:py-6">
      {/* Header Skeleton */}
      <div className="border-b pb-5">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="mt-2 h-4 w-96 rounded-md" />
      </div>

      {/* Grid Layout Skeleton */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Basic Information */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b pb-3">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>

          {/* Card 2: Variants */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <Skeleton className="h-36 w-full rounded-lg" />
          </div>

          {/* Card 3: Media Gallery */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs">
            <div className="border-b pb-3">
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* Organization Card */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs">
            <div className="border-b pb-3">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          {/* SEO Card */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
