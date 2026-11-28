/**
 * @file components/store/home/latest-products/latest-products-skeleton.tsx
 * @description Loading placeholder matching the latest products grid layout.
 */

import { Skeleton } from "@/components/ui/skeleton"
import {
  LATEST_PRODUCTS_GRID_CLASS,
  LATEST_PRODUCTS_LIMIT,
} from "./latest-products-grid"

interface LatestProductsSkeletonProps {
  /** فعّله إذا كنت تمرر viewAllHref للقسم */
  showViewAll?: boolean
}

export function LatestProductsSkeleton({
  showViewAll = false,
}: LatestProductsSkeletonProps) {
  return (
    <div aria-hidden="true" className="space-y-4 sm:space-y-6">
      {/* الترويسة */}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          {/* العنوان */}
          <div className="flex h-7 items-center sm:h-8">
            <Skeleton className="h-5 w-40 sm:h-6 sm:w-48" />
          </div>
          {/* الوصف */}
          <div className="flex h-5 items-center">
            <Skeleton className="h-3.5 w-64 max-w-full" />
          </div>
        </div>

        {showViewAll && <Skeleton className="h-8 w-24 shrink-0" />}
      </div>

      {/* شبكة المنتجات */}
      <ul className={LATEST_PRODUCTS_GRID_CLASS}>
        {Array.from({ length: LATEST_PRODUCTS_LIMIT }, (_, index) => (
          <li key={index} className="min-w-0">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
              {/* الصورة */}
              <Skeleton className="aspect-square w-full rounded-none" />

              <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
                {/* الماركة أو التصنيف */}
                <div className="flex h-4 items-center">
                  <Skeleton className="h-3 w-1/3" />
                </div>

                {/* اسم المنتج: سطران */}
                <div>
                  <div className="flex h-5 items-center">
                    <Skeleton className="h-3.5 w-full" />
                  </div>
                  <div className="flex h-5 items-center">
                    <Skeleton className="h-3.5 w-2/3" />
                  </div>
                </div>

                {/* التقييم */}
                <div className="flex h-4 items-center gap-1">
                  <Skeleton className="size-3.5 shrink-0 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>

                {/* السعر والسعر القديم */}
                <div className="mt-auto flex flex-wrap items-center gap-x-2 pt-1">
                  <div className="flex h-6 items-center">
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
