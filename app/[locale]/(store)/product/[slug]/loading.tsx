/**
 * @file app/[locale]/(store)/product-details/[slug]/loading.tsx
 * @description Skeleton shown while the product details page is loading.
 */

import { STORE_CONTAINER } from "@/lib/config/app_config"
import { cn } from "@/lib/utils"

function Block({ className }: { className: string }) {
  return <div className={cn("rounded-2xl bg-muted", className)} />
}

export default function ProductDetailsLoading() {
  return (
    <main
      aria-busy="true"
      className={cn(STORE_CONTAINER, "flex animate-pulse flex-col gap-6 py-6 md:py-8")}
    >
      <Block className="h-4 w-56" />
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12 lg:gap-14">
        <Block className="aspect-square w-full rounded-3xl md:col-span-6 lg:col-span-7" />
        <div className="space-y-6 md:col-span-6 lg:col-span-5">
          <Block className="h-4 w-32" />
          <Block className="h-9 w-4/5" />
          <Block className="h-12 w-1/2" />
          <Block className="h-24 w-full" />
          <Block className="h-14 w-full rounded-full" />
          <Block className="h-40 w-full" />
        </div>
      </div>
    </main>
  )
}
