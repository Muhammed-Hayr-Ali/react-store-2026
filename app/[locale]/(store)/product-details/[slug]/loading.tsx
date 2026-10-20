/**
 * @file app/[locale]/(store)/product-details/[slug]/loading.tsx
 * @description Loading skeleton for the product details page.
 */

export default function ProductDetailsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-10 animate-pulse">
      {/* هيكل عظمي وهمي لتفاصيل المنتج */}
      <div className="space-y-4">
        <div className="h-9 w-3/4 rounded-lg bg-muted" />
        <div className="h-20 w-full rounded-lg bg-muted" />
      </div>

      {/* هيكل عظمي وهمي لقسم التقييمات */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="space-y-2">
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
          <div className="h-9 w-28 rounded-md bg-muted" />
        </div>

        <div className="h-36 w-full rounded-2xl bg-muted" />

        <div className="space-y-3">
          <div className="h-24 w-full rounded-xl bg-muted" />
          <div className="h-24 w-full rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}