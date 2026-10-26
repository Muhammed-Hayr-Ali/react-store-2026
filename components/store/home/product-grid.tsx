"use client"

/**
 * @file components/store/home/product-grid.tsx
 * @description Responsive grid/list wrapper for product cards with view mode toggle.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { LayoutGridIcon, ListIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"
import { SimplifiedRegularProduct } from "@/lib/actions/store/queries/get-latest-regular-products"

interface ProductGridProps {
  products: SimplifiedRegularProduct[]
  emptyMessage?: string
  viewMode: "grid" | "list"
}


export function ProductGrid({ products, emptyMessage, viewMode }: ProductGridProps) {
  const t = useTranslations("Home")
  const [mode, setMode] = React.useState<"grid" | "list">(viewMode)

  // دالة لتغيير وحفظ طريقة العرض في الكوكيز
  const handleViewModeChange = (mode: "grid" | "list") => {
    setMode(mode)
    try {
      document.cookie = `${"store_product_view_mode"}=${mode}; path=/; max-age=31536000; SameSite=Lax`
    } catch (error) {
      console.error("Failed to save view mode cookie", error)
    }
  }

  const resolvedEmptyMessage =
    emptyMessage ||
    t("NO_PRODUCTS_AVAILABLE", { default: "No products available." })

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-37.5 w-full items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 text-center text-xs text-muted-foreground">
        {resolvedEmptyMessage}
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {/* Header with Title and View Mode Toggles */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {t("NEW_ARRIVALS", { default: "New Arrivals" })}
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {t("NEW_ARRIVALS_DESC", {
              default: "Explore our latest additions and everyday essentials.",
            })}
          </p>
        </div>

        {/* أزرار اختيار طريقة العرض */}
        <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 p-1">
          <Button
            size="icon"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            className={`size-7 rounded-full transition-all ${
              viewMode === "grid"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleViewModeChange("grid")}
            aria-label="Grid view"
          >
            <LayoutGridIcon className="size-3.5" />
          </Button>

          <Button
            size="icon"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            className={`size-7 rounded-full transition-all ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleViewModeChange("list")}
            aria-label="List view"
          >
            <ListIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Products Container */}
      <div
        className={
          mode === "grid"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2"
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout={mode === "grid" ? "vertical" : "horizontal"}
          />
        ))}
      </div>
    </section>
  )
}
