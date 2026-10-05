import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-2 py-4 md:px-4 md:py-6">
      {/* Header Skeleton */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-7 w-40 rounded-md" />
        </div>
        <Skeleton className="mt-2 h-4 w-80 rounded-md" />
      </div>

      {/* 2-Column Responsive Layout Skeleton */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Permissions Matrix Skeleton */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>

            {/* مجموعات الصلاحيات (محاكاة 4 بطاقات مجموعات) */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="space-y-3 rounded-lg border border-border bg-muted/10 p-4"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar): Role Info & Summary Skeleton */}
        <div className="space-y-6">
          {/* Card 1: Role Information */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>

          {/* Card 2: Coverage Summary */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="border-b border-border/60 pb-3">
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
