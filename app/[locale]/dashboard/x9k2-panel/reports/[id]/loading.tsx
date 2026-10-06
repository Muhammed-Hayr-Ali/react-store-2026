import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* 1. Header Skeleton مطابق لترويسة صفحة تفاصيل البلاغ */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-44 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-1 h-3.5 w-60 rounded-md" />
        </div>
      </div>

      {/* 2. Grid Layout بنظام العمودين مطابق تماماً لـ report-details-view */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* العمود الرئيسي الأيسر (lg:col-span-2) */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Card 1: Issue Information */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-5 w-48 rounded-md" />
              </div>

              <div className="space-y-1.5">
                <Skeleton className="h-3 w-32 rounded-md" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Card 2: Reported Content Preview */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-44 rounded-md" />
              </div>
            </div>

            <div className="space-y-2.5 rounded-lg border border-border/60 bg-muted/15 p-3.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-8 w-48 rounded-md" />
            </div>
          </div>

          {/* Card 3: Reporter Info (موقعها الصحيح في العمود الأيسر) */}
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Skeleton className="h-3 w-12 rounded-md" />
                <Skeleton className="h-4 w-36 rounded-md" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Skeleton className="h-3 w-14 rounded-md" />
                <Skeleton className="h-3.5 w-64 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* العمود الجانبي الأيمن (lg:col-span-1) */}
        <div className="min-w-0 space-y-6">
          {/* Moderation Action Card */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="border-b border-border/40 pb-2">
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>

            <div className="space-y-3">
              {/* Status Select */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>

              {/* Admin Notes Textarea */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>

              {/* Save Button */}
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
