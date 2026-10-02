"use client"

import * as React from "react"
import {
  LatestProductItem,
  CategoryProductItem,
  BrandProductItem,
} from "@/lib/actions/products/types"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { ProductCard } from "./product-card"
import { LayoutGridIcon, RowsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductsGridProps {
  title?: string
  products: (LatestProductItem | CategoryProductItem | BrandProductItem)[]
  currency: CurrencyCode
  exchangeRate: number
  initialViewMode?: "grid" | "list" // ✅ تأتي من الخادم بعد قراءة الكوكيز
}

export default function ProductsGrid({
  title,
  products,
  currency,
  exchangeRate,
  initialViewMode = "grid",
}: ProductsGridProps) {
  // ✅ نستخدم القيمة القادمة من السيرفر مباشرة كحالة ابتدائية.
  // هذا يضمن تطابقاً تاماً بين ما يرسمه السيرفر وما يرسمه العميل (Zero Hydration Mismatch).
  const [viewMode, setViewMode] = React.useState<"grid" | "list">(
    initialViewMode
  )

  // عند تغيير الوضع، نحدث الحالة فوراً (تحديث فوري بدون إعادة تحميل)
  // ونحفظها في الكوكيز للزيارات القادمة أو عند تحديث الصفحة
  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode)
    document.cookie = `product_view_mode=${mode}; max-age=${60 * 60 * 24 * 365}; path=/`
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
      <div className="mb-3 flex items-center justify-between">
        {title ? (
          <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {title}
          </h2>
        ) : (
          <div />
        )}

        {/* أزرار التبديل بين العرض الشبكي والمستطيل */}
        <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 p-0.5">
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => toggleViewMode("grid")}
            className="size-7 rounded-md p-1"
            title="عرض شبكي"
          >
            <LayoutGridIcon className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => toggleViewMode("list")}
            className="size-7 rounded-md p-1"
            title="عرض قائمة مستطيلة"
          >
            <RowsIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* التوزيع يتغير حسب الخيار المختار فوراً وبسلاسة */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4"
            : "flex flex-col gap-2.5 sm:gap-3"
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            exchangeRate={exchangeRate}
            viewMode={viewMode}
          />
        ))}
      </div>
    </section>
  )
}
