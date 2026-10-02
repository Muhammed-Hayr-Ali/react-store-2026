import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getProductCompleteBySlug } from "@/lib/actions/products/queries/get-complete-by-slug"
import { getCategoryById } from "@/lib/actions/categories/queries/get-by-id"
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

// استيرادات تعدد العملات
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get_selected_currency"
import { getExchangeRates } from "@/lib/actions/currency/queries/get-rates"

// Shadcn UI Breadcrumb
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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
  const { slug, locale } = await params
  const user = await getCurrentUser()

  const productResult = await getProductCompleteBySlug(slug)

  if (!productResult.success || !productResult.data) {
    notFound()
  }

  const product = productResult.data
  const productId = product.id

  const parentCategoryId = (product.category as { parent_id?: string | null })
    ?.parent_id

  // جلب البيانات بالتوازي لأفضل أداء ممكن
  const [
    summaryResult,
    reviewsResult,
    parentCategoryResult,
    selectedCurrency,
    exchangeRates,
  ] = await Promise.all([
    getReviewSummary(productId),
    getProductReviewsList(productId),
    parentCategoryId
      ? getCategoryById(parentCategoryId)
      : Promise.resolve(null),
    getSelectedCurrency(),
    getExchangeRates(),
  ])

  // حساب معدل الصرف بأمان
  const currentRate =
    exchangeRates.find((r) => r.currency_code === selectedCurrency)
      ?.rate_from_usd ?? 1

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

  const parentCategory = parentCategoryResult?.success
    ? parentCategoryResult.data
    : null

  const currentCategory = product.category

  // تحديد الأسماء بحسب اللغة النشطة
  const isAr = locale === "ar"
  const homeLabel = isAr ? "الرئيسية" : "Home"

  const parentCategoryName = parentCategory
    ? isAr && parentCategory.name_ar
      ? parentCategory.name_ar
      : parentCategory.name
    : null

  const currentCategoryName = currentCategory
    ? isAr && currentCategory.name_ar
      ? currentCategory.name_ar
      : currentCategory.name
    : null

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6 md:pt-32 md:pb-24 lg:px-8">
      {/* روابط التنقل السريع Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            {/* رابط الصفحة الرئيسية */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/${locale}`}
                  className="transition-colors hover:text-foreground"
                >
                  {homeLabel}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {/* رابط التصنيف الأب (إن وجد) */}
            {parentCategory && parentCategory.slug && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/${locale}/category/${parentCategory.slug}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {parentCategoryName}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}

            {/* رابط التصنيف الحالي المباشر للمنتج */}
            {currentCategory && currentCategory.slug && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/${locale}/category/${currentCategory.slug}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {currentCategoryName}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}

            {/* عنصر المنتج الحالي المعروض */}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[12rem] truncate font-medium text-foreground sm:max-w-xs">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* قسم تفاصيل المنتج */}
      <ProductDetailsPage
        product={product}
        currency={selectedCurrency}
        exchangeRate={currentRate}
      />

      {/* قسم المراجعات والتقييمات */}
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
