import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* 1. ترويسة الحملة مع شارة البرق والعداد التنازلي */}
      <div className="mb-6 rounded-2xl border border-destructive/20 bg-linear-to-b from-destructive/10 via-destructive/5 to-transparent p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {/* أيقونة البرق المربعة */}
              <Skeleton className="size-7 rounded-lg sm:size-8" />
              {/* عنوان حملة التخفيض */}
              <Skeleton className="h-6 w-36 rounded-md sm:h-8 sm:w-56" />
            </div>
            {/* وصف الحملة */}
            <Skeleton className="h-3.5 w-48 rounded-xs sm:h-4 sm:w-72" />
          </div>

          {/* حاوية العداد التنازلي التنافسي */}
          <div className="flex items-center gap-2 rounded-xl bg-background/80 p-2 shadow-xs backdrop-blur-xs">
            <Skeleton className="h-3 w-14 rounded-xs" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-7 w-7 rounded-md sm:h-8 sm:w-8"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. شريط الأدوات وشبكة FlashSaleGrid */}
      <div className="space-y-4">
        {/* شريط عدد المنتجات وأزرار التبديل (Grid / List) */}
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <Skeleton className="h-4 w-20 rounded-xs" />

          <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 p-0.5">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="size-7 rounded-md" />
          </div>
        </div>

        {/* شبكة بطاقات FlashProductCard المطابقة لتوزيع الـ Grid الفعلي */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="flex w-full flex-col overflow-hidden rounded-lg border border-destructive/20 bg-card"
            >
              {/* صورة المنتج مع شارة الخصم العائمة */}
              <div className="relative aspect-square w-full bg-muted/20">
                <Skeleton className="size-full rounded-none" />
                <Skeleton className="absolute inset-s-1 top-1 h-3.5 w-9 rounded" />
              </div>

              {/* تفاصيل البطاقة الخاصة بالتخفيض الخاطف */}
              <div className="flex flex-1 flex-col justify-between p-1.5 sm:p-2">
                <div className="min-w-0 flex-1 space-y-1">
                  {/* اسم التصنيف */}
                  <Skeleton className="h-2 w-12 rounded-xs" />
                  {/* اسم المنتج */}
                  <Skeleton className="h-3 w-4/5 rounded-xs sm:h-3.5" />

                  {/* محاكاة شريط الكمية المباعة (Sold Progress) */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-2 w-6 rounded-xs" />
                      <Skeleton className="h-2 w-5 rounded-xs" />
                    </div>
                    <Skeleton className="h-1 w-full rounded-full" />
                  </div>
                </div>

                {/* سعر التخفيض، السعر المشطوب، وزر السلة الدائري */}
                <div className="mt-1 flex items-center justify-between gap-1.5 border-t border-border/30 pt-1">
                  <div className="space-y-0.5">
                    <Skeleton className="h-3.5 w-12 rounded-xs sm:h-4 sm:w-14" />
                    <Skeleton className="h-2.5 w-9 rounded-xs line-through" />
                  </div>
                  <Skeleton className="size-5.5 rounded-full sm:size-6.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
