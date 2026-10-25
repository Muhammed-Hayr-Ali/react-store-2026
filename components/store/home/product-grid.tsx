"use client"

/**
 * @file components/store/home/product-grid.tsx
 * @description Responsive grid/list wrapper for product cards with view mode stored in cookies.
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
}

const COOKIE_NAME = "store_product_view_mode"

// دالة مساعدة لقراءة الكوكي أثناء تهيئة الحالة بدون الحاجة لـ useEffect
const getInitialViewMode = (): "grid" | "list" => {
  if (typeof window === "undefined") return "grid"
  try {
    const cookies = document.cookie.split("; ")
    const viewModeCookie = cookies.find((row) => row.startsWith(`${COOKIE_NAME}=`))
    if (viewModeCookie) {
      const value = viewModeCookie.split("=")[1]
      if (value === "list" || value === "grid") {
        return value
      }
    }
  } catch (error) {
    console.error("Failed to read view mode cookie", error)
  }
  return "grid"
}

export function ProductGrid({
  products,
  emptyMessage,
}: ProductGridProps) {
  const t = useTranslations("Home")
  
  // تعيين القيمة الأولية مباشرة من الكوكيز لتجنب أي رندر إضافي أو تحذير
  const [viewMode, setViewMode] = React.useState<"grid" | "list">(getInitialViewMode)

  // دالة لتغيير وحفظ طريقة العرض في الكوكيز
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode)
    try {
      document.cookie = `${COOKIE_NAME}=${mode}; path=/; max-age=31536000; SameSite=Lax`
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
        <div className="flex items-center gap-1 rounded-full bg-muted/40 p-1 border border-border/50">
          <Button
            size="icon"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            className={`size-7 rounded-full transition-all ${
              viewMode === "grid" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
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
              viewMode === "list" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
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
          viewMode === "grid"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2"
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout={viewMode === "grid" ? "vertical" : "horizontal"}
          />
        ))}
      </div>
    </section>
  )
}