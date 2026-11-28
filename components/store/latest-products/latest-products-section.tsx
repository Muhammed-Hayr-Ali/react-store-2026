/**
 * @file components/store/home/latest-products/latest-products-section.tsx
 * @description Server component displaying the newest store products in a responsive grid.
 */

import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"
import { ProductCard } from "./product-card"
import {
  LATEST_PRODUCTS_GRID_CLASS,
  LATEST_PRODUCTS_LIMIT,
} from "./latest-products-grid"

interface LatestProductsSectionProps {
  /** رابط صفحة كل المنتجات. لا يظهر زر "عرض الكل" دون تمريره */
  viewAllHref?: string
}

export async function LatestProductsSection({
  viewAllHref,
}: LatestProductsSectionProps) {
  // الدالة ترتب حسب created_at تنازلياً
  const result = await getFilteredProducts({ limit: LATEST_PRODUCTS_LIMIT })

  // الخطأ مسجل في الخادم داخل الدالة، ونخفي القسم حتى لا تتأثر بقية الصفحة
  if (!result.success || !result.data?.length) return null

  const t = await getTranslations("LatestProducts")

  return (
    <section
      aria-labelledby="latest-products-title"
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="latest-products-title"
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            {t("SECTION_TITLE")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("SECTION_DESCRIPTION")}
          </p>
        </div>

        {viewAllHref && (
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href={viewAllHref}>
              {t("VIEW_ALL_BUTTON")}
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 rtl:rotate-180"
              />
            </Link>
          </Button>
        )}
      </div>

      <ul className={LATEST_PRODUCTS_GRID_CLASS}>
        {result.data.map((product) => (
          <li key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
