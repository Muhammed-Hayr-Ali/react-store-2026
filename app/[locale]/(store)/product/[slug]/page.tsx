/**
 * @file app/[locale]/(store)/product-details/[slug]/page.tsx
 * @description Server Component page for storefront product details, integrating product info and reviews section.
 */

import { notFound } from "next/navigation"

import { getProductDetails } from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { getProductReviews } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"
import { APP_CONFIG } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import ProductDetailsClientWrapper from "@/components/product-details/product-details-client-wrapper"

interface ProductDetailsPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: ProductDetailsPageProps) {
  const { slug } = await params

  const productResult = await getProductDetails(slug)

  if (!productResult.success || !productResult.data) {
    return createMetadata({
      siteName: APP_CONFIG.NAME,
      title: "Product Not Found",
      description: "The requested product could not be found.",
    })
  }

  const product = productResult.data

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: product.meta_title || product.name || product.slug,
    description:
      product.meta_description || product.description || product.slug,
  })
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params

  // 1. جلب تفاصيل المنتج أولاً للحصول على الـ id الخاص به
  const productResult = await getProductDetails(slug)

  if (!productResult.success || !productResult.data) {
    notFound()
  }

  const product = productResult.data

  // 2. جلب جميع التعليقات والملخص باستخدام معرف المنتج المستخرج
  const reviewsResult = await getProductReviews(product.id)
  const reviewsData = reviewsResult.success ? reviewsResult.data : null

  return (
    <ProductDetailsClientWrapper product={product} reviewsData={reviewsData} />
  )
}
