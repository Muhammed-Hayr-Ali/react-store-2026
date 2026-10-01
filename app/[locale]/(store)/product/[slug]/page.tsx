import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductCompleteBySlug } from "@/lib/actions/products/queries/get-complete-by-slug"
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

  const productResult = await getProductCompleteBySlug(slug)

  if (!productResult.success || !productResult.data) {
    notFound()
  }

  const productId = productResult.data.id

  const [summaryResult, reviewsResult] = await Promise.all([
    getReviewSummary(productId),
    getProductReviewsList(productId),
  ])

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
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6 md:pt-32 md:pb-24 lg:px-8">
      {/* Product Details Section */}
      <ProductDetailsPage product={productResult.data} />
      {/* Reviews Section */}
      <div id="reviews" className="mt-16 border-t border-border/60 pt-12">
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
