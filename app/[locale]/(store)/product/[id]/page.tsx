import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductCompleteById } from "@/lib/actions/products/queries/get-complete-by-id"
import { getReviewSummary, getProductReviewsList } from "@/lib/actions/reviews"
import ProductDetailsPage from "@/components/store/product/ProductDetailsPage/ProductDetailsPage"
import ProductReviews from "@/components/store/product/ProductReviews"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"
import type {
  ReviewSummary,
  ReviewWithProfile,
} from "@/lib/actions/reviews/types"
import { getCurrentUser } from "@/lib/actions/utils/profile"

interface ProductPageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getProductCompleteById(id)

  if (!result.success || !result.data) {
    return { title: "منتج غير موجود" }
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
  const { id } = await params

  const user = await getCurrentUser()

  // 1. جلب البيانات بشكل متوازي
  const [productResult, summaryResult, reviewsResult] = await Promise.all([
    getProductCompleteById(id),
    getReviewSummary(id),
    getProductReviewsList(id),
  ])

  // 2. التحقق من وجود المنتج
  if (!productResult.success || !productResult.data) {
    notFound()
  }

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
    // ✅ التطابق التام مع الناف بار: نفس العرض ونفس الهوامش الجانبية
    <main className="mx-auto max-w-262.5 px-4 pt-24 pb-12 sm:px-6 md:pt-28 md:pb-20 lg:px-8">
      {/* قسم تفاصيل المنتج الرئيسي */}
      <ProductDetailsPage product={productResult.data} />

      {/* قسم التقييمات الجديد */}
      <div className="mt-16 border-t border-muted/50 pt-12">
        {/* ✅ تمرير productId لحل خطأ TypeScript نهائياً */}
        <ProductReviews
          currentUserId={user?.id}
          summary={summary}
          reviews={reviews}
          productId={id}
        />
      </div>
    </main>
  )
}
