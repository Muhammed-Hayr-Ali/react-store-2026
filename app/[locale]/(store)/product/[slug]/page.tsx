import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductCompleteBySlug } from "@/lib/actions/products/queries/get-complete-by-slug" // ✅ الاستيراد الجديد
import { getReviewSummary, getProductReviewsList } from "@/lib/actions/reviews"
import ProductDetailsPage from "@/components/store/product/ProductDetailsPage/ProductDetailsPage"
import ProductReviews from "@/components/store/product/ProductReviews/ProductReviews"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"
import type {
  ReviewSummary,
  ReviewWithProfile,
} from "@/lib/actions/reviews/types"
import { getCurrentUser } from "@/lib/actions/utils/profile"


interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getProductCompleteBySlug(slug)

  if (!result.success || !result.data) {
    return { title: "Product Not Found" }
  }

  const primaryImage =
    result.data.product_images?.find((img) => img.is_primary)?.url ||
    result.data.product_images?.[0]?.url ||
    appConfig.icons.apple ||
    "/logo.png"

  return createMetadata({
    siteName: appConfig.name,
    title: result.data.name,
    description: result.data.meta_description || result.data.name,
    image: primaryImage,
  })
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const user = await getCurrentUser()

  // 1. جلب بيانات المنتج أولاً باستخدام الـ Slug
  const productResult = await getProductCompleteBySlug(slug)

  // إذا لم يتم العثور على المنتج، عرض صفحة 404
  if (!productResult.success || !productResult.data) {
    notFound()
  }

  // ✅ استخراج الـ ID من المنتج لاستخدامه في جلب التقييمات
  const productId = productResult.data.id

  // 2. جلب بيانات التقييمات بشكل متوازي باستخدام الـ ID
  const [summaryResult, reviewsResult] = await Promise.all([
    getReviewSummary(productId),
    getProductReviewsList(productId),
  ])

  // 3. تضييق النوع (Type Narrowing) لضمان عدم وجود undefined
  const defaultSummary: ReviewSummary = {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  }

  const summary: ReviewSummary =
    summaryResult.success && summaryResult.data
      ? summaryResult.data
      : defaultSummary

  const reviews: ReviewWithProfile[] =
    reviewsResult.success && reviewsResult.data ? reviewsResult.data : []

  return (
    <main className="mx-auto max-w-262.5 px-4 pt-24 pb-12 sm:px-6 md:pt-28 md:pb-20 lg:px-8">
      {/* قسم تفاصيل المنتج الرئيسي */}
      <ProductDetailsPage product={productResult.data} />

      {/* قسم التقييمات الجديد */}
      <div className="mt-16 border-t border-muted/50 pt-12">
        <ProductReviews
          currentUserId={user?.id}
          summary={summary}
          reviews={reviews}
          productId={productId} 
        />
      </div>
    </main>
  )
}
