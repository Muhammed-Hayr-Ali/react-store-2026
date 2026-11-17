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

  // Selected Category (تبدأ بـ "*" التي تعني الكل)
  const [selectedCategory, setSelectedCategory] = React.useState<string>("*")

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const LATEST_LIMIT = 12
      const NEXT_PAGE = page + 1

      // إذا كانت القيمة "*" نترك categoryId غير مرسل أو undefined
      const results = await getFilteredProducts({
        categoryId: selectedCategory === "*" ? undefined : selectedCategory,
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

  const handleOnSelectCategory = async (categoryId: string) => {
    try {
      setSelectedCategory(categoryId)
      setPage(1)
      setHasMore(true) // إعادة تفعيل حالة التحمرير للتصنيف الجديد

      const LATEST_LIMIT = 12
      const results = await getFilteredProducts({
        categoryId: categoryId === "*" ? undefined : categoryId,
        limit: LATEST_LIMIT,
        page: 1,
      })

      if (results.success) {
        setProducts(results.data)
        setPage(2) // الصفحة الأولى تمت، والصفحة القادمة ستكون 2

        // إذا كانت المنتجات المسترجعة أقل من الحد الأقصى، فهذا يعني أنه لا يوجد المزيد
        if (results.data.length < LATEST_LIMIT) {
          setHasMore(false)
        }
      } else {
        setProducts([])
        setHasMore(false)
      }
    } catch (error) {
      console.error("Failed to filter products by category:", error)
    }
  }

  return (
    <div className="flex flex-1 flex-col space-y-4 md:space-y-6">
      <CategoriesScroll
        categories={categories}
        onSelect={handleOnSelectCategory}
      />

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
