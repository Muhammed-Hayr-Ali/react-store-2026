"use client"

/**
 * @file components/store/product-details/details/product-breadcrumb.tsx
 * @description Breadcrumb navigation for the product details page showing localized category and product hierarchy.
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
    <Breadcrumb>
      <BreadcrumbList>
        {/* الصفحة الرئيسية للمتجر مع دعم اللغة */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${locale}`}>{t("HOME", { default: "Home" })}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* التصنيف الأب (إن وجد) مع استخدام الـ slug والـ locale الصحيح */}
        {parentCategory && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${locale}/categories/${parentCategory.slug}`}>
                  {parentCat}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* التصنيف الحالي مع استخدام الـ slug والـ locale الصحيح */}
        {category && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${locale}/categories/${category.slug}`}>
                  {rootCategory}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* اسم المنتج الحالي */}
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-50 truncate font-medium text-foreground sm:max-w-xs">
            {productName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}