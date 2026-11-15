"use client"

import React from "react"
import CategoriesScroll from "../categories-scroll/categories-scroll"
import { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-root-categories"
import { useTranslations } from "next-intl"
import { SimpliProduct } from "@/components/store/product-grid/product-card"
import { ProductGrid } from "@/components/store/product-grid/product-grid"
import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"

export interface ClientWrapperProps {
  categories: SimplifiedRootCategory[]
  initialProducts: SimpliProduct[]
  viewMode: "grid" | "list"
}

export default function HomeClientWrapper({
  categories,
  initialProducts,
  viewMode,
}: ClientWrapperProps) {
  const t = useTranslations("Home")

  const [products, setProducts] =
    React.useState<SimpliProduct[]>(initialProducts)
  const [page, setPage] = React.useState<number>(1)
  const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false)
  const [hasMore, setHasMore] = React.useState<boolean>(true)

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const LATEST_LIMIT = 12
      const NEXT_PAGE = page + 1
      const ACTIVE_ONLY = true

      const results = await getFilteredProducts({
        limit: LATEST_LIMIT,
        page: NEXT_PAGE,
        activeOnly: ACTIVE_ONLY,
      })

      if (!results.success || results.data.length === 0) {
        setHasMore(false)
      } else {
        setProducts((prev) => [...prev, ...results.data])
        setPage(NEXT_PAGE)
      }
    } catch (error) {
      console.error("Failed to load more products:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <CategoriesScroll categories={categories} />

      <ProductGrid
        name={t("NEW_ARRIVALS")}
        viewMode={viewMode}
        hasError={false}
        initialProducts={products}

        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </div>
  )
}
