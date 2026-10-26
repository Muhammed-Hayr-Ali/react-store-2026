/**
 * @file app/[locale]/(store)/product-details/[slug]/loading.tsx
 * @description Loading skeleton for the product details page matching the exact two-column layout.
 */

 
export default function ProductDetailsLoading() {
  return (
    <div className="flex flex-col gap-8 pb-16 animate-pulse">
      {/* 0. مسار التنقل الوهمي (Breadcrumb Skeleton) */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 rounded bg-muted/60" />
        <div className="h-3 w-3 rounded-full bg-muted/40" />
        <div className="h-4 w-20 rounded bg-muted/60" />
        <div className="h-3 w-3 rounded-full bg-muted/40" />
        <div className="h-4 w-32 rounded bg-muted/60" />
      </div>

      {/* تخطيط الشبكة الرئيسي (مطابق لـ ProductInfoSection) */}
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
        {/* 1. قسم معرض الصور الوهمي (Gallery Skeleton) */}
        <div className="md:col-span-6 space-y-4">
          {/* الصورة الرئيسية الكبيرة */}
          <div className="aspect-square w-full rounded-2xl bg-muted/60" />
          {/* صور مصغرة تحتها */}
          <div className="flex gap-4">
            <div className="size-20 rounded-xl bg-muted/60" />
            <div className="size-20 rounded-xl bg-muted/60" />
            <div className="size-20 rounded-xl bg-muted/60" />
          </div>
        </div>

        {/* 2. قسم المعلومات والخيارات الوهمي (Details Skeleton) */}
        <div className="flex flex-col gap-6 md:col-span-6">
          {/* التصنيف والبراند */}
          <div className="h-4 w-36 rounded-md bg-muted/60" />

          {/* العنوان والوصف */}
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded-lg bg-muted/60" />
            <div className="h-4 w-full rounded-md bg-muted/40" />
            <div className="h-4 w-5/6 rounded-md bg-muted/40" />
          </div>

          {/* السعر والمخزون */}
          <div className="h-10 w-40 rounded-lg bg-muted/60" />

          {/* خيارات المنتجات (Variations) */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <div className="h-4 w-24 rounded bg-muted/60" />
            <div className="flex gap-3">
              <div className="h-10 w-16 rounded-xl bg-muted/60" />
              <div className="h-10 w-16 rounded-xl bg-muted/40" />
              <div className="h-10 w-16 rounded-xl bg-muted/40" />
            </div>
          </div>

          {/* أزرار الشراء */}
          <div className="flex gap-4 pt-4">
            <div className="h-12 flex-1 rounded-xl bg-muted/60" />
            <div className="size-12 rounded-xl bg-muted/60" />
          </div>

          {/* شارات الثقة الوهمية */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40">
            <div className="h-10 rounded-lg bg-muted/40" />
            <div className="h-10 rounded-lg bg-muted/40" />
          </div>
        </div>
      </div>

      {/* 3. قسم التقييمات الوهمي (Reviews Section Skeleton) */}
      <div className="space-y-6 pt-12 border-t border-border/40">
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 rounded-md bg-muted/60" />
          <div className="h-10 w-32 rounded-xl bg-muted/60" />
        </div>
        <div className="h-32 w-full rounded-2xl bg-muted/60" />
      </div>
    </div>
  )
}