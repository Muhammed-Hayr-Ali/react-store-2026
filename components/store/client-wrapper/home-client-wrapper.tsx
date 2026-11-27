"use client"

import React from "react"
import { SimpliProduct } from "@/components/store/product-grid/product-card"
import { ProductGrid } from "@/components/store/product-grid/product-grid"
import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"

export interface ClientWrapperProps {
  initialProducts: SimpliProduct[]
  viewMode: "grid" | "list"
}

export default function HomeClientWrapper({
  initialProducts,
  viewMode,
}: ClientWrapperProps) {
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

      // إذا كانت القيمة "*" نترك categoryId غير مرسل أو undefined
      const results = await getFilteredProducts({
        limit: LATEST_LIMIT,
        page: NEXT_PAGE,
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
    <div className="flex flex-1 flex-col space-y-4 md:space-y-6">
      <ProductGrid
        // name={t("NEW_ARRIVALS")}
        viewMode={viewMode}
        hasError={false}
        initialProducts={products}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        hasAction={false}
        className="px-4 md:px-6 lg:px-8"
      />
    </div>
  )
}
