"use client"

import React from "react"
import CategoriesScroll from "./categories-scroll"
import { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-root-categories"
import { useTranslations } from "next-intl"
import { SimpliProduct } from "@/components/shared/products-view/product-card"
import { ProductGrid } from "@/components/shared/products-view/product-grid"

export interface MainSectionProps {
  categories: SimplifiedRootCategory[]
  initialProducts: SimpliProduct[]
  viewMode: "grid" | "list"
}
export default function MainSection({
  categories,
  initialProducts,
  viewMode,
}: MainSectionProps) {
  const t = useTranslations("Home")
  const [categorySlog, setCategorySlog] = React.useState<string>("*")

  function handelOnSelect(categorySlog: string) {
    setCategorySlog(categorySlog)
    if (categorySlog !== "*") {
    }
  }

  return (
    <div className="lg:px-8s flex flex-col space-y-6 px-4 sm:px-6">
      <CategoriesScroll
        value={categorySlog}
        categories={categories}
        onSelect={handelOnSelect}
      />

      <ProductGrid
        title={t("NEW_ARRIVALS")}
        viewMode={viewMode}
        hasError={false}
        initialProducts={initialProducts}
      />
    </div>
  )
}
