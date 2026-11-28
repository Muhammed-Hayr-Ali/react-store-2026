"use client"

/**
 * @file components/store/product-details/details/product-breadcrumb.tsx
 * @description Breadcrumb navigation for the product details page showing localized category and product hierarchy.
 */

import * as React from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { CategoryDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { APP_ROUTES } from "@/lib/config/app-routes"

interface ProductBreadcrumbProps {
  category: CategoryDetail | null
  parentCategory?: CategoryDetail | null
  productName: string
}

export function ProductBreadcrumb({
  category,
  parentCategory,
  productName,
}: ProductBreadcrumbProps) {
  const t = useTranslations("ProductDetails")
  const locale = useLocale()

  const localizedName = (item?: CategoryDetail | null) =>
    locale === "ar" ? item?.name_ar || item?.name : item?.name

  const categoryName = localizedName(category)
  const parentName = localizedName(parentCategory)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* الصفحة الرئيسية للمتجر مع دعم اللغة */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={APP_ROUTES.HOME}>{t("HOME")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="rtl:[&>svg]:rotate-180" />

        {/* التصنيف الأب (إن وجد) مع استخدام الـ slug والـ locale الصحيح */}
        {parentCategory && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`${APP_ROUTES.CATEGORIES}/${parentCategory.slug}`}>
                  {parentName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="rtl:[&>svg]:rotate-180" />
          </>
        )}

        {/* التصنيف الحالي مع استخدام الـ slug والـ locale الصحيح */}
        {category && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`${APP_ROUTES.CATEGORIES}/${category.slug}`}>
                  {categoryName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="rtl:[&>svg]:rotate-180" />
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
