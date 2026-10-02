import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, PackageXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import ProductsGrid from "@/components/store/home/products-grid"
import { getProductsByCategory } from "@/lib/actions/products/queries/get-products-by-category"
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get_selected_currency"
import { getExchangeRates } from "@/lib/actions/currency/queries/get-rates"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"

interface CategoryPageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const categoryTitle = decodeURIComponent(slug).replace(/-/g, " ")

  return createMetadata({
    siteName: appConfig.name,
    title: categoryTitle.charAt(0).toUpperCase() + categoryTitle.slice(1),
    description: `Explore products in ${categoryTitle}`,
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params
  const isRtl = locale === "ar"

  // جلب المنتجات ومعلومات العملة بالتوازي
  const [productsResult, selectedCurrency, exchangeRates] = await Promise.all([
    getProductsByCategory({
      categorySlug: slug,
      limit: 40,
      activeOnly: true,
    }),
    getSelectedCurrency(),
    getExchangeRates(),
  ])

  // في حال كان التصنيف غير موجود في قاعدة البيانات
  if (
    !productsResult.success &&
    productsResult.error === "CATEGORY_NOT_FOUND"
  ) {
    notFound()
  }

  const products =
    productsResult.success && productsResult.data ? productsResult.data : []

  // حساب سعر الصرف المقابل للعملة الحالية
  const currentRate =
    exchangeRates.find((r) => r.currency_code === selectedCurrency)
      ?.rate_from_usd ?? 1

  // استخراج اسم التصنيف من أول منتج إن وجد، أو من الـ slug كقيمة احتياطية
  const categoryName =
    products[0]?.category_name || decodeURIComponent(slug).replace(/-/g, " ")

  return (
    <div className="flex w-full flex-col py-4 sm:py-6">
      {/* شريط مسار التصفح والرجوع */}
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6">
        <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
            >
              <Link
                href={`/${locale}`}
                aria-label={isRtl ? "العودة للرئيسية" : "Back to Home"}
              >
                {isRtl ? (
                  <ArrowRightIcon className="size-4" />
                ) : (
                  <ArrowLeftIcon className="size-4" />
                )}
              </Link>
            </Button>
            <h1 className="text-lg font-bold tracking-tight text-foreground capitalize sm:text-2xl">
              {categoryName}
            </h1>
          </div>

          <span className="text-xs text-muted-foreground sm:text-sm">
            {products.length} {isRtl ? "منتج" : "products"}
          </span>
        </div>
      </div>

      {/* عرض المنتجات عبر الـ Grid أو عرض رسالة فارغة */}
      {products.length > 0 ? (
        <ProductsGrid
          title=""
          products={products}
          currency={selectedCurrency}
          exchangeRate={currentRate}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <PackageXIcon className="size-7" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
            {isRtl ? "لا توجد منتجات حالياً" : "No products found"}
          </h2>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground sm:text-sm">
            {isRtl
              ? "لم يتم إضافة أي منتجات ضمن هذا التصنيف حتى الآن."
              : "There are no products listed under this category right now."}
          </p>
          <Button
            asChild
            variant="secondary"
            className="mt-5 rounded-full text-xs"
          >
            <Link href={`/${locale}`}>
              {isRtl ? "تصفح باقي الأقسام" : "Browse all sections"}
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
