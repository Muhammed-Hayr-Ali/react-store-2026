import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full pt-2 pb-8 sm:pt-4 sm:pb-12">
      {/* 1. ترويسة صفحة الماركة مع زر الرجوع */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-md sm:h-7 sm:w-44" />
          </div>
          <Skeleton className="h-4 w-16 rounded-md sm:w-20" />
        </div>
      </div>

      {/* 2. حاوية المنتجات المطابقة تماماً لـ ProductsGrid */}
      <section className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
        {/* شريط أدوات الفرز والتبديل (View Mode Toggle Skeleton) */}
        <div className="mb-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 p-0.5">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="size-7 rounded-md" />
          </div>
        </div>

        {/* شبكة البطاقات مطابقة تماماً لتوزيع ProductsGrid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex w-full flex-col overflow-hidden rounded-lg border border-border/50 bg-card"
            >
              {/* صورة المنتج المربعة بالكامل */}
              <div className="aspect-square w-full bg-muted/30">
                <Skeleton className="size-full rounded-none" />
              </div>

              {/* تفاصيل البطاقة الداخلية */}
              <div className="flex flex-1 flex-col justify-between p-2 sm:p-2.5">
                <div className="min-w-0 flex-1 space-y-1">
                  {/* تصنيف خفيف */}
                  <Skeleton className="h-2.5 w-14 rounded-xs" />
                  {/* اسم المنتج سطر واحد */}
                  <Skeleton className="h-3.5 w-4/5 rounded-xs sm:h-4" />
                </div>

                {/* السعر وزر الإضافة الدائري مع الخط الفاصل */}
                <div className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-border/30 pt-1.5">
                  <Skeleton className="h-3.5 w-12 rounded-xs sm:h-4 sm:w-16" />
                  <Skeleton className="size-6.5 rounded-full sm:size-7" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
