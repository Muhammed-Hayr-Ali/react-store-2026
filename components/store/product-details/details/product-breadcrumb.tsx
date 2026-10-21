"use client"

/**
 * @file components/store/product-details/details/product-breadcrumb.tsx
 * @description Breadcrumb navigation for the product details page showing category and product hierarchy.
 */

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CategoryDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"

interface ProductBreadcrumbProps {
  category: CategoryDetail | null
  parentCategory?: CategoryDetail | null
  productName: string
  locale: string
}

export function ProductBreadcrumb({
  category,
  parentCategory,
  productName,
  locale,
}: ProductBreadcrumbProps) {
  const t = useTranslations("ProductDetails")

  const rootCategory = locale === "ar" ? category?.name_ar : category?.name
  const parentCat =
    locale === "ar" ? parentCategory?.name_ar : parentCategory?.name

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {/* الصفحة الرئيسية للمتجر */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/store">{t("HOME", { default: "Store" })}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* التصنيف الأب (إن وجد) */}
        {parentCategory && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/store/categories/${parentCategory.slug}`}>
                  {parentCat}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* التصنيف الحالي */}
        {category && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/store/categories/${category.slug}`}>
                  {rootCategory}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-50 truncate font-medium text-foreground sm:max-w-xs">
            {productName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
