/**
 * @file app/[locale]/(store)/loading.tsx
 * @description Loading skeleton for the storefront home page matching the exact layout.
 */

import { ProductCardSkeleton } from "@/omponents/store/skeletons/product-card-skeleton"

 
export default function StoreLoading() {
  // مصفوفة وهمية لتمثيل 8 كارتات منتجات
  const productSkeletons = Array.from({ length: 8 }, (_, i) => i)
  // مصفوفة وهمية لتمثيل كبسولات التصنيفات الأفقية في الشريط
  const categorySkeletons = Array.from({ length: 6 }, (_, i) => i)

  return (
    <div className="space-y-12 pb-12 animate-pulse">
      {/* 1. هيكل السلايدر الوهمي (Hero Slider Skeleton) */}
      <div className="aspect-[21/9] w-full rounded-3xl bg-muted/60" />

      {/* 2. هيكل شريط التصنيفات الأفقية (Categories Scroll Skeleton) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded-md bg-muted/60" />
          <div className="flex gap-1">
            <div className="size-7 rounded-full bg-muted/40" />
            <div className="size-7 rounded-full bg-muted/40" />
          </div>
        </div>

        <div className="flex gap-3 overflow-hidden py-1">
          {categorySkeletons.map((index) => (
            <div
              key={index}
              className="flex shrink-0 items-center gap-2.5 rounded-xl bg-muted/50 px-4 py-2.5"
            >
              <div className="size-8 rounded-lg bg-muted/60" />
              <div className="h-4 w-20 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. هيكل شبكة المنتجات (Product Grid Skeleton) */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-44 rounded-md bg-muted/60" />
          <div className="h-4 w-72 rounded-md bg-muted/40" />
        </div>

        {/* شبكة الكارتات مطابقة لشبكة ProductGrid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {productSkeletons.map((index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}