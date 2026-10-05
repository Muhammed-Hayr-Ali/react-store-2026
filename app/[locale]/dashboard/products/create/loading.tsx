import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* 1. Header Skeleton مطابق لترويسة صفحة إنشاء المنتج */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-7 w-44 rounded-md sm:h-8" />
          </div>
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
        </div>
      </div>

      {/* 2. Grid Layout بنظام العمودين مطابق لـ product-form */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* العمود الأيسر الرئيسي (2 أعمدة) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Basic Information */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-5 w-36 rounded-md" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-3 w-12 rounded-md" />
              </div>
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>

          {/* Card 2: Variants & Pricing */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3 w-56 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>

            {/* هيكل المتغير الافتراضي */}
            <div className="space-y-3 rounded-lg border border-border bg-muted/10 p-4">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="size-7 rounded-md" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
          </div>

          {/* Card 3: Media Gallery */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>

            {/* هيكل صورة المعرض الافتراضية */}
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/10 p-4 sm:flex-row">
              <Skeleton className="size-20 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="size-7 rounded-md" />
                </div>
                <Skeleton className="h-8 w-full rounded-md" />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* العمود الأيمن الجانبي (Sidebar) */}
        <div className="space-y-6">
          {/* Card 1: Product Status */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="border-b border-border/60 pb-3">
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/15 p-3">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-16 rounded-md" />
                <Skeleton className="h-2.5 w-36 rounded-md" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/15 p-3">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-16 rounded-md" />
                <Skeleton className="h-2.5 w-36 rounded-md" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>

          {/* Card 2: Organization Card */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="border-b border-border/60 pb-3">
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
            {/* Category Select + Buttons */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="size-9 rounded-md" />
              </div>
            </div>
            {/* Brand Select + Buttons */}
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="size-9 rounded-md" />
              </div>
            </div>
          </div>

          {/* Card 3: SEO Details */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
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
