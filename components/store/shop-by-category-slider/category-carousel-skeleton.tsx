/**
 * @file components/store/shop-by-category-slider/category-carousel-skeleton.tsx
 * @description الهيكل العظمي لسلايدر التصنيفات، بنفس تخطيط الكمبوننت الأصلي.
 */

import { Skeleton } from "@/components/ui/skeleton"

interface CategoryCarouselSkeletonProps {
  /** عدد البطاقات، ويكفي 6 لملء العرض في كل المقاسات */
  itemsCount?: number
}

export function CategoryCarouselSkeleton({
  itemsCount = 6,
}: CategoryCarouselSkeletonProps) {
  return (
    <section aria-hidden="true" className="w-full">
      <div className="w-full space-y-4">
        {/* الترويسة */}
        <div className="flex items-center justify-between gap-4">
          {/* العنوان */}
          <div className="flex h-7 items-center">
            <Skeleton className="h-5 w-32 md:w-40" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* رابط عرض الكل */}
            <div className="flex h-6 items-center gap-1.5 px-1.5 sm:h-7">
              <Skeleton className="h-3 w-12 sm:h-3.5 sm:w-14" />
              <Skeleton className="size-3.5 shrink-0 rounded-full" />
            </div>

            {/* زرا السابق والتالي */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={index}
                  className="flex size-8 items-center justify-center"
                >
                  <Skeleton className="size-4 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* البطاقات */}
        <div className="overflow-hidden">
          <div className="-ms-2.5 flex sm:-ms-3">
            {Array.from({ length: itemsCount }, (_, index) => (
              <div
                key={index}
                className="min-w-0 shrink-0 grow-0 basis-[28.5%] ps-2.5 sm:basis-[25%] sm:ps-3 md:basis-[22%] lg:basis-[20%]"
              >
                <div className="flex flex-col gap-4">
                  {/* الصورة */}
                  <Skeleton className="aspect-square w-full rounded-xl sm:rounded-2xl" />

                  {/* اسم التصنيف والسهم */}
                  <div className="flex h-4 w-full items-center justify-between gap-2 px-0.5 sm:h-5">
                    <Skeleton className="h-3 w-3/4 sm:h-3.5 sm:w-2/3" />
                    <Skeleton className="hidden size-4 shrink-0 rounded-full sm:block" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
