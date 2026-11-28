/**
 * @file components/store/featured-hero-slider/featured-hero-slider-skeleton.tsx
 * @description الهيكل العظمي لسلايدر المنتجات المميزة، بنفس تخطيط الكمبوننت الأصلي.
 */

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface FeaturedHeroSliderSkeletonProps {
  /** عدد نقاط التنقل، والافتراضي يساوي FEATURED_LIMIT */
  dotsCount?: number
}

export function FeaturedHeroSliderSkeleton({
  dotsCount = 8,
}: FeaturedHeroSliderSkeletonProps) {
  // مكان زر بحجم size-7 وبداخله أيقونة
  const renderControl = (iconClass: string) => (
    <div className="flex size-7 shrink-0 items-center justify-center">
      <Skeleton className={cn("rounded-full", iconClass)} />
    </div>
  )

  const renderPrevNextWithDots = () => (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {renderControl("size-4")}

      <div className="flex items-center">
        {Array.from({ length: dotsCount }, (_, index) => (
          <div
            key={index}
            className="flex h-6 min-w-6 items-center justify-center px-0.5"
          >
            <Skeleton
              className={cn("h-1.5 rounded-full", index === 0 ? "w-7" : "w-1.5")}
            />
          </div>
        ))}
      </div>

      {renderControl("size-4")}
    </div>
  )

  // سطر بارتفاع text-xs (16px) حتى لا يقفز التخطيط عند اكتمال التحميل
  const renderSmallText = (widthClass: string) => (
    <div className="flex h-4 items-center">
      <Skeleton className={cn("h-3", widthClass)} />
    </div>
  )

  return (
    <section aria-hidden="true" className="w-full">
      {/* البطاقة */}
      <div className="relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-muted/70 via-background to-primary/10 md:min-h-96 md:flex-row lg:min-h-104">
        {/* الصورة */}
        <div className="relative aspect-16/10 w-full shrink-0 md:order-2 md:aspect-auto md:w-1/2">
          <div className="absolute inset-[12%] -z-10 rounded-full bg-primary/15 blur-3xl" />
          <Skeleton className="absolute inset-4 rounded-2xl md:inset-8" />
          {/* شارة الخصم */}
          <Skeleton className="absolute inset-e-3 top-3 h-6 w-16 rounded-full" />
        </div>

        {/* المعلومات */}
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-2.5 p-5 md:order-1 md:gap-3 md:p-8 lg:gap-4 lg:p-12">
          {/* العلامة التجارية • التصنيف */}
          <div className="flex h-4 items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="size-1 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* العنوان: سطران */}
          <div className="w-full">
            {["w-full", "w-2/3"].map((width) => (
              <div
                key={width}
                className="flex h-[1.71875rem] items-center md:h-[2.0625rem] lg:h-[2.578125rem]"
              >
                <Skeleton className={cn("h-5 md:h-6 lg:h-7", width)} />
              </div>
            ))}
          </div>

          {/* الوصف: مخفي على الجوال */}
          <div className="w-full max-w-md max-md:hidden">
            {["w-full", "w-4/5"].map((width) => (
              <div key={width} className="flex h-[1.421875rem] items-center">
                <Skeleton className={cn("h-3.5", width)} />
              </div>
            ))}
          </div>

          {/* التقييم */}
          <div className="flex h-4 items-center gap-1.5">
            <Skeleton className="size-3.5 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>

          {/* السعر وزر التسوق */}
          <div className="mt-auto flex w-full flex-wrap items-center justify-between gap-3 md:mt-2 md:w-auto md:justify-start md:gap-6">
            <div className="flex h-7 items-center gap-x-2 md:h-8">
              <Skeleton className="h-5 w-20 md:h-6 md:w-24" />
              <Skeleton className="h-3 w-12 md:h-3.5 md:w-14" />
            </div>
            <Skeleton className="h-10 w-32 rounded-full md:h-11 md:w-36" />
          </div>
        </div>
      </div>

      {/* شريط التحكم وسعر الصرف */}
      <div className="mt-3">
        {/* الشاشات الكبيرة: صف واحد */}
        <div className="hidden items-center justify-between gap-3 sm:flex">
          <div className="flex items-center gap-1">
            {renderControl("size-3.5")}
            {renderPrevNextWithDots()}
          </div>

          <div className="ms-auto flex flex-wrap items-center gap-x-3 gap-y-1">
            {renderSmallText("w-16")}
            {renderSmallText("w-16")}
            {renderSmallText("w-16")}
            {renderSmallText("w-24")}
            <Skeleton className="size-4 shrink-0 rounded-full" />
          </div>
        </div>

        {/* الشاشات الصغيرة */}
        <div className="flex flex-col sm:hidden">
          <div className="flex items-center justify-between">
            {renderControl("size-3.5")}
            {renderPrevNextWithDots()}
            <span className="size-7 shrink-0" />
          </div>

          <hr className="my-2.5 border-border/60" />

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              {renderSmallText("w-16")}
              <div className="flex items-center gap-3">
                {renderSmallText("w-16")}
                {renderSmallText("w-16")}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              {renderSmallText("w-28")}
              <Skeleton className="size-4 shrink-0 rounded-full" />
            </div>

            <hr className="my-2.5 border-border/60" />
          </div>
        </div>
      </div>
    </section>
  )
}
