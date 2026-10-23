/**
 * @file app/[locale]/(store)/wishlist/loading.tsx
 * @description Loading skeleton for the wishlist page.
 */

import * as React from "react"
import { HeartIcon } from "lucide-react"

export default function WishlistLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6 animate-pulse">
      {/* رأس الصفحة الوهمي */}
      <header className="flex items-center gap-2 border-b border-border/40 pb-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <HeartIcon className="size-4 opacity-50" />
        </span>
        <div className="space-y-1.5">
          <div className="h-6 w-36 rounded-md bg-muted" />
          <div className="h-4 w-60 rounded-md bg-muted/60" />
        </div>
      </header>

      {/* شبكة بطاقات المنتجات الوهمية (Skeletons) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-4 space-y-3"
          >
            {/* مكان الصورة */}
            <div className="aspect-square w-full rounded-xl bg-muted" />
            
            {/* مكان العنوان والبراند */}
            <div className="space-y-2">
              <div className="h-3 w-16 rounded bg-muted/70" />
              <div className="h-4 w-full rounded bg-muted" />
            </div>

            {/* مكان السعر */}
            <div className="h-5 w-20 rounded bg-muted pt-1" />
          </div>
        ))}
      </div>
    </main>
  )
}