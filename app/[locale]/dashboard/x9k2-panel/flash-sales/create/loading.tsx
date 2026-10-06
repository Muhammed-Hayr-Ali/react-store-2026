import { Skeleton } from "@/components/ui/skeleton"

export default function CreateFlashSaleLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* 1. Header Skeleton مطابق لترويسة صفحة الإنشاء */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-48 rounded-md" />
          </div>
          <Skeleton className="mt-2 h-4 w-72 rounded-md" />
        </div>
      </div>

      {/* 2. Grid Layout بنظام العمودين مطابق لـ flash-sale-form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* العمود الرئيسي الأيسر (lg:col-span-2) */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Card 1: General Information */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-6">
            <div className="border-b border-border/40 pb-2">
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Skeleton className="h-3.5 w-16 rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          </div>

          {/* Card 2: Participating Products Table */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-6">
            <div className="flex flex-col gap-2 border-b border-border/40 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-44 rounded-md" />
                <Skeleton className="h-3 w-64 rounded-md" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>

            {/* هيكل جدول المنتجات الداخلي */}
            <div className="overflow-hidden rounded-lg border border-border">
              {/* Table Header */}
              <div className="flex h-9 items-center justify-between border-b border-border bg-muted/40 px-3">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-3.5 w-14 rounded-md" />
                <Skeleton className="h-3.5 w-16 rounded-md" />
                <Skeleton className="h-3.5 w-12 rounded-md" />
                <Skeleton className="h-3.5 w-6 rounded-md" />
              </div>

              {/* Table Rows */}
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex h-14 items-center justify-between border-b border-border px-3 last:border-0"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-2.5 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-7 w-28 rounded-md" />
                  <Skeleton className="h-7 w-16 rounded-md" />
                  <Skeleton className="h-4 w-14 rounded-md" />
                  <Skeleton className="h-7 w-14 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* العمود الجانبي الأيمن (lg:col-span-1) */}
        <div className="min-w-0 space-y-6 lg:col-span-1">
          {/* Card 1: Campaign Status */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-2.5 w-40 rounded-md" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>

          {/* Card 2: Schedule & Duration */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="border-b border-border/40 pb-2">
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>

            <div className="space-y-3">
              {/* Date Range Picker */}
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>

              {/* Start & End Time Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Actions Bar Footer */}
      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <Skeleton className="h-9 w-full rounded-md sm:w-28" />
        <Skeleton className="h-9 w-full rounded-md sm:w-36" />
      </div>
    </div>
  )
}
