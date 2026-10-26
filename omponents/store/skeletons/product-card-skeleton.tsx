/**
 * @file components/store/skeletons/product-card-skeleton.tsx
 * @description Skeleton loader for product cards matching the store design.
 */

export function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card p-3 space-y-3">
      {/* صورة المنتج الوهمية */}
      <div className="aspect-square w-full rounded-xl bg-muted/60 animate-pulse" />

      {/* تفاصيل المنتج الوهمية */}
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-3 w-1/2 rounded-md bg-muted/40 animate-pulse" />
      </div>

      {/* السعر والتقييم الوهمي */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-4 w-1/3 rounded-md bg-muted/60 animate-pulse" />
        <div className="h-4 w-1/4 rounded-md bg-muted/40 animate-pulse" />
      </div>
    </div>
  )
}