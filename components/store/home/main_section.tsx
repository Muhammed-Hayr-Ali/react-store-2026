"use client"

import React from "react"
import CategoriesScroll from "./categories-scroll"
import { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-root-categories"
import { ProductGrid, ProductGridProps } from "./product-grid"
import { useTranslations } from "next-intl"

export interface MainSectionProps extends ProductGridProps {
  categories: SimplifiedRootCategory[]
}
export default function MainSection({
  categories,
  initialProducts,
  viewMode,
  fetchMoreAction,
}: MainSectionProps) {
  const t = useTranslations("Home")
  const [categorySlog, setCategorySlog] = React.useState<string>("*")

  function handelOnSelect(categorySlog: string) {
    setCategorySlog(categorySlog)
    if(categorySlog !== "*"){

    }
  }

  return (
    <div className="flex flex-col space-y-6 px-4 sm:px-6 lg:px-8">
      <CategoriesScroll
        value={categorySlog}
        categories={categories}
        onSelect={handelOnSelect}
      />

      {/* 3. شبكة المنتجات مع التحميل التلقائي (Infinite Scroll) */}
      <ProductGrid
        title={t("NEW_ARRIVALS", { default: "New Arrivals" })}
        description={t("NEW_ARRIVALS_DESC", {
          default: "Explore our latest additions and everyday essentials.",
        })}
        viewMode={viewMode}
        initialProducts={initialProducts}
        emptyMessage={t("NO_PRODUCTS_AVAILABLE", {
          default: "No new products available right now.",
        })}
        fetchMoreAction={fetchMoreAction}
      />
    </div>
  )
}
