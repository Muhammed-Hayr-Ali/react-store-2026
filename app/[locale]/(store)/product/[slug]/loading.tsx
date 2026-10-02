import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-8 sm:px-6 sm:pt-4 sm:pb-12 lg:px-8">
      {/* 1. مسار التنقل السريع Breadcrumb مطابق للشكل الفعلي */}
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <Skeleton className="h-4 w-12 rounded-sm" />
        <span className="text-muted-foreground/30">/</span>
        <Skeleton className="h-4 w-20 rounded-sm" />
        <span className="text-muted-foreground/30">/</span>
        <Skeleton className="h-4 w-24 rounded-sm" />
        <span className="text-muted-foreground/30">/</span>
        <Skeleton className="h-4 w-32 rounded-sm" />
      </div>

      {/* 2. قسم تفاصيل المنتج المطابق لـ ProductDetailsPage تماماً */}
      <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
        {/* المعرض المرئي ProductGallery */}
        <div className="space-y-4 lg:col-span-6">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          {/* شريط الصور المصغرة */}
          <div className="flex items-center gap-3 py-1">
            <Skeleton className="size-18 shrink-0 rounded-xl" />
            <Skeleton className="size-18 shrink-0 rounded-xl" />
            <Skeleton className="size-18 shrink-0 rounded-xl" />
          </div>
        </div>

        {/* تفاصيل المنتج والخيارات المطابقة للجانب الأيمن */}
        <div className="space-y-6 lg:col-span-6">
          {/* ترويسة المنتج ProductHeader */}
          <div className="space-y-2.5">
            {/* روابط التصنيف والماركة */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-md" />
              <span className="text-muted-foreground/30">•</span>
              <Skeleton className="h-4 w-16 rounded-sm" />
            </div>

            {/* عنوان المنتج */}
            <Skeleton className="h-8 w-4/5 rounded-lg sm:h-9" />

            {/* السعر وشارة التوفر */}
            <div className="flex h-11 items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-28 rounded-md sm:h-9 sm:w-32" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          <Separator />

          {/* محدد المتغيرات ProductVariantSelector */}
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-16 rounded-sm" />
            <div className="flex flex-wrap gap-2.5">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>

          <Separator />

          {/* أفعال الشراء ProductActions */}
          <div className="space-y-4">
            {/* صندوق تحديد الكمية وإجمالي السعر */}
            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/15 p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-14 rounded-sm" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              <div className="space-y-1 text-end">
                <Skeleton className="ms-auto h-3 w-16 rounded-sm" />
                <Skeleton className="ms-auto h-6 w-20 rounded-md" />
              </div>
            </div>

            {/* زر إضافة للسلة الكبير */}
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          {/* شارات الثقة ProductTrustBadges */}
          <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-4">
            <div className="flex flex-col items-center gap-1.5">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-xs" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-xs" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-xs" />
            </div>
          </div>

          {/* وصف المنتج Overview */}
          <div className="space-y-2 border-t border-border/60 pt-4">
            <Skeleton className="h-3 w-16 rounded-xs" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full rounded-xs" />
              <Skeleton className="h-3.5 w-5/6 rounded-xs" />
              <Skeleton className="h-3.5 w-2/3 rounded-xs" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. قسم المراجعات ProductReviews في الأسفل */}
      <div className="mt-12 border-t border-border/60 pt-10 sm:mt-16 sm:pt-12">
        <div className="space-y-4">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
