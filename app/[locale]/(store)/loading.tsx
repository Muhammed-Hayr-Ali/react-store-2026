import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex w-full flex-col pt-4">
      {/* 1. هيكل السلايدر الرئيسي (FeaturedHeroSlider Skeleton) */}
      <section aria-label="Featured Products" className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            <Skeleton className="h-56 w-full rounded-2xl sm:h-72 sm:rounded-3xl md:h-84 lg:h-96" />
            {/* مؤشرات التمرير السفلية */}
            <div className="absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1 sm:bottom-2.5 sm:gap-1.5">
              <Skeleton className="h-1 w-4 rounded-full sm:h-1.5 sm:w-5" />
              <Skeleton className="size-1 rounded-full sm:size-1.5" />
              <Skeleton className="size-1 rounded-full sm:size-1.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. شريط تمرير التصنيفات (CategoriesScroll Skeleton) */}
      <section aria-label="Product Categories" className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-md" />
            <div className="flex items-center gap-1">
              <Skeleton className="size-7 rounded-full sm:size-8" />
              <Skeleton className="size-7 rounded-full sm:size-8" />
            </div>
          </div>

          <div className="flex gap-2 overflow-hidden py-1 sm:gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="flex shrink-0 items-center gap-2.5 rounded-xl bg-muted/50 px-3.5 py-2 sm:px-4 sm:py-2.5"
              >
                <Skeleton className="size-7 rounded-lg sm:size-8" />
                <Skeleton className="h-4 w-16 rounded-xs sm:w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. قسم البيع السريع (FlashSaleSection Skeleton) */}
      <section className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <div className="rounded-xl border border-destructive/20 bg-linear-to-b from-destructive/5 to-transparent p-2.5 sm:p-3.5">
          {/* ترويسة القسم على سطرين */}
          <div className="mb-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-6 rounded-md sm:size-7" />
                <Skeleton className="h-5 w-28 rounded-md sm:w-36" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-14 rounded-xs" />
                <div className="flex items-center gap-0.5">
                  <Skeleton className="size-6.5 rounded-full sm:size-7" />
                  <Skeleton className="size-6.5 rounded-full sm:size-7" />
                </div>
              </div>
            </div>

            {/* عداد الوقت التنازلي */}
            <div className="flex items-center gap-1 pt-0.5 sm:gap-1.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-7 w-7 rounded-md sm:h-8 sm:w-8"
                />
              ))}
            </div>
          </div>

          {/* مسار منتجات العرض السريع */}
          <div className="flex gap-2 py-0.5 sm:gap-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="min-w-0 shrink-0 basis-[46%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%]"
              >
                <div className="flex w-full flex-col overflow-hidden rounded-lg border border-destructive/20 bg-card">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-1 p-1.5 sm:p-2">
                    <Skeleton className="h-2 w-10 rounded-xs" />
                    <Skeleton className="h-3 w-4/5 rounded-xs" />
                    <div className="mt-1 flex items-center justify-between border-t border-border/30 pt-1">
                      <Skeleton className="h-3 w-10 rounded-xs" />
                      <Skeleton className="size-5.5 rounded-full sm:size-6.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. شبكة أحدث المنتجات (ProductsGrid Skeleton) */}
      <section className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-6 w-32 rounded-md sm:w-40" />

          {/* أزرار التبديل Grid / List */}
          <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 p-0.5">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="size-7 rounded-md" />
          </div>
        </div>

        {/* شبكة بطاقات المنتجات */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex w-full flex-col overflow-hidden rounded-lg border border-border/50 bg-card"
            >
              <div className="aspect-square w-full bg-muted/30">
                <Skeleton className="size-full rounded-none" />
              </div>

              <div className="flex flex-1 flex-col justify-between p-2 sm:p-2.5">
                <div className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-2.5 w-14 rounded-xs" />
                  <Skeleton className="h-3.5 w-4/5 rounded-xs sm:h-4" />
                </div>

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
