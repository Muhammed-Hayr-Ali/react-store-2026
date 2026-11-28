/**
 * @file components/store/home/latest-products/latest-products-skeleton.tsx
 * @description Loading placeholder matching the latest products grid layout.
 */

import { Skeleton } from "@/components/ui/skeleton"
import {
  LATEST_PRODUCTS_GRID_CLASS,
  LATEST_PRODUCTS_LIMIT,
} from "./latest-products-grid"

export function LatestProductsSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className={LATEST_PRODUCTS_GRID_CLASS}>
        {Array.from({ length: LATEST_PRODUCTS_LIMIT }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <Skeleton className="aspect-square rounded-none" />
            <div className="space-y-2 p-3 sm:p-4">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
