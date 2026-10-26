/**
 * @file app/[locale]/(store)/brands/[slug]/loading.tsx
 * @description Loading skeleton for category and brand pages.
 */

import { ProductCardSkeleton } from "@/omponents/store/skeletons/product-card-skeleton"

 
export default function Loading() {
  // سنقوم بعرض 8 كارتات وهمية تحاكي شبكة المنتجات
  const skeletons = Array.from({ length: 8 }, (_, i) => i)

  return (
    <div className="container py-8 space-y-8">
      {/* العنوان الوهمي */}
      <div className="h-8 w-48 rounded-lg bg-muted/60 animate-pulse" />

      {/* شبكة الكارتات الوهمية مطابقة تماماً لشبكة ProductGrid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {skeletons.map((index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}