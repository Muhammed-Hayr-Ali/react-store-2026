"use client"

/**
 * @file components/store/home/wishlist-product-grid.tsx
 * @description Flexible product grid wrapper supporting infinite scroll, view mode control, and automatic synchronization with wishlist context.
 */

import * as React from "react"
import { useTranslations } from "next-intl"

import { WishlistProductCard } from "./wishlist-product-card"

import { WishlistProduct } from "@/lib/actions/wishlists/queries/get-wishlist"
import ViewMode from "../shared/view_mode"

interface WishlistProductGridProps {
  initialProducts: WishlistProduct[]
  viewMode: "grid" | "list"
}

export function WishlistProductGrid({
  initialProducts,
  viewMode: initialViewMode,
}: WishlistProductGridProps) {
  const t = useTranslations("Wishlist")

  const [mode, setMode] = React.useState<"grid" | "list">(initialViewMode)

  return (
    <section className="space-y-6 py-6 md:space-y-8 md:py-8">
      {/* Header & Toolbar Section: يبقى العنوان ظاهراً دائماً */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {t("PAGE_TITLE")}
        </h2>

        {/* يختفي زر طريقة العرض (Toolbar) إذا لم تكن هناك عناصر */}
        <ViewMode initValue={mode} onChange={setMode} />
      </div>
      <div
        className={
          mode === "grid"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2"
        }
      >
        {initialProducts.map((product) => (
          <WishlistProductCard
            key={product.id}
            product={product}
            layout={mode === "grid" ? "vertical" : "horizontal"}
          />
        ))}
      </div>
    </section>
  )
}
