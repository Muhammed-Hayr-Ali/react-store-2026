"use client"

/**
 * @file components/store/home/product-grid.tsx
 * @description Responsive grid/list wrapper for product cards with infinite scroll support and view mode toggle.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { LayoutGridIcon, ListIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"
import { SimplifiedRegularProduct } from "@/lib/actions/store/queries/get-latest-regular-products"

interface ProductGridProps {
  initialProducts: SimplifiedRegularProduct[]
  emptyMessage?: string
  viewMode: "grid" | "list"
  fetchMoreAction: (page: number) => Promise<{ success: boolean; data?: SimplifiedRegularProduct[]; hasMore?: boolean }>
}

export function ProductGrid({
  initialProducts,
  emptyMessage,
  viewMode,
  fetchMoreAction,
}: ProductGridProps) {
  const t = useTranslations("Home")
  const [mode, setMode] = React.useState<"grid" | "list">(viewMode)
  const [products, setProducts] = React.useState<SimplifiedRegularProduct[]>(initialProducts)
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(initialProducts.length >= 12)
  const [isLoading, setIsLoading] = React.useState(false)

  const loaderRef = React.useRef<HTMLDivElement>(null)
  const COOKIE_NAME = "store_product_view_mode"

  // دالة لتغيير وحفظ طريقة العرض في الكوكيز
  const handleViewModeChange = (newMode: "grid" | "list") => {
    setMode(newMode)
    try {
      document.cookie = `${COOKIE_NAME}=${newMode}; path=/; max-age=31536000; SameSite=Lax`
    } catch (error) {
      console.error("Failed to save view mode cookie", error)
    }
  }

  // دالة جلب المزيد من المنتجات تلقائياً عند التمرير
  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const nextPage = page + 1
      const result = await fetchMoreAction(nextPage)

      if (result.success && result.data && result.data.length > 0) {
        setProducts((prev) => {
          // دمج القائمة القديمة والجديدة مع منع تكرار نفس الـ ID نهائياً
          const existingIds = new Set(prev.map((p) => p.id))
          const uniqueNewProducts = result.data!.filter((p) => !existingIds.has(p.id))

          if (uniqueNewProducts.length === 0) {
            setHasMore(false)
          }

          return [...prev, ...uniqueNewProducts]
        })
        setPage(nextPage)
        
        if (result.hasMore === false) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Failed to fetch more products", error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, page, fetchMoreAction])
  // مراقبة الوصول لنهاية الصفحة لتفعيل التحميل التلقائي
  React.useEffect(() => {
    const currentLoader = loaderRef.current
    if (!currentLoader || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    )

    observer.observe(currentLoader)

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader)
      }
    }
  }, [loadMore, hasMore, isLoading])

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
            variant={mode === "grid" ? "secondary" : "ghost"}
            className={`size-7 rounded-full transition-all ${
              mode === "grid"
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
            variant={mode === "list" ? "secondary" : "ghost"}
            className={`size-7 rounded-full transition-all ${
              mode === "list"
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

      {/* عنصر مراقبة التمرير للتحميل التلقائي */}
      <div ref={loaderRef} className="flex justify-center py-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>{t("LOADING", { default: "Loading more products..." })}</span>
          </div>
        )}
      </div>
    </section>
  )
}