/**
 * @file app/[locale]/(store)/product-details/[slug]/page.tsx
 * @description Server Component page for storefront product details, composing the breadcrumb, product info, and reviews sections.
 */

import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { getProductDetails } from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { getProductReviews } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"
import { APP_CONFIG, STORE_CONTAINER } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { cn } from "@/lib/utils"
import { ProductBreadcrumb } from "@/components/product-details/details/product-breadcrumb"
import { ProductInfoSection } from "@/components/product-details/details/product-info-section"
import { ProductReviewsSection } from "@/components/product-details/reviews/product-reviews-section"

interface ProductDetailsPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: ProductDetailsPageProps) {
  const { slug, locale } = await params

  const productResult = await getProductDetails(slug)

  if (!productResult.success) {
    const t = await getTranslations({ locale, namespace: "ProductDetails" })

    return createMetadata({
      siteName: APP_CONFIG.NAME,
      title: t("NOT_FOUND_TITLE"),
      description: t("NOT_FOUND_DESCRIPTION"),
    })
  }

  const product = productResult.data

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: product.meta_title || product.name,
    description:
      product.meta_description || product.description || product.name,
  })
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params

  // 1. جلب تفاصيل المنتج أولاً للحصول على الـ id الخاص به
  const productResult = await getProductDetails(slug)

  if (!productResult.success) {
    // 404 فقط عندما يكون المنتج غير موجود، أما أخطاء الجلب فتذهب إلى error.tsx
    if (productResult.error === "FETCH_PRODUCT_ERROR") {
      throw new Error(productResult.error)
    }
    notFound()
  }

  const product = productResult.data

  // 2. جلب جميع التعليقات والملخص باستخدام معرف المنتج المستخرج
  const reviewsResult = await getProductReviews(product.id)
  const reviewsData = reviewsResult.success ? reviewsResult.data : null

  return (
    <main className={cn(STORE_CONTAINER, "flex flex-col gap-6 py-6 md:py-8")}>
      <ProductBreadcrumb
        category={product.category}
        parentCategory={product.parent_category}
        productName={product.name}
      />

      {/* key يعيد ضبط المتغير والكمية والصورة عند الانتقال إلى منتج آخر */}
      <ProductInfoSection key={product.id} product={product} />

      <div className="mt-6 border-t border-border/60 pt-10 md:mt-10">
        <ProductReviewsSection reviewsData={reviewsData} />
      </div>
    </main>
  )
}
