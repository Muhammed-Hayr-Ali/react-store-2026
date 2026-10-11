import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* 1. Header Skeleton مطابق لترويسة صفحة إنشاء الدور */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-40 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>
      </div>

      {/* 2. Grid Layout بنظام العمودين مطابق تماماً لـ create-role-form */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Permissions Matrix */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3 w-56 rounded-md" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>

            {/* محاكاة بطاقات مجموعات الصلاحيات */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="space-y-3 rounded-lg border border-border bg-muted/10 p-4"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-7 w-24 rounded-md" />
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

        {/* Right Column (Sidebar): Role Info & Coverage Summary */}
        <div className="min-w-0 space-y-6">
          {/* Card 1: Role Information */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-5 w-32 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-3 w-12 rounded-md" />
              </div>
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>

          {/* Card 2: Coverage Summary */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-5 w-36 rounded-md" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* 3. Bottom Actions Bar Footer */}
      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <Skeleton className="h-9 w-full rounded-md sm:w-28" />
        <Skeleton className="h-9 w-full rounded-md sm:w-32" />
      </div>
    </div>
  )
}
