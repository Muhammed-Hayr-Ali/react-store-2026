import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, PackageXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import ProductsGrid from "@/components/store/home/products-grid"
import { getProductsByBrand } from "@/lib/actions/products/queries/get-products-by-brand"
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get_selected_currency"
import { getExchangeRates } from "@/lib/actions/currency/queries/get-rates"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"

interface BrandPageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params
  const brandTitle = decodeURIComponent(slug).replace(/-/g, " ")

  return createMetadata({
    siteName: appConfig.name,
    title: brandTitle.charAt(0).toUpperCase() + brandTitle.slice(1),
    description: `Explore products from ${brandTitle}`,
  })
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { locale, slug } = await params

  // جلب منتجات الماركة ومعلومات العملة بالتوازي
  const [productsResult, selectedCurrency, exchangeRates] = await Promise.all([
    getProductsByBrand({
      brandSlug: slug,
      limit: 40,
      activeOnly: true,
    }),
    getSelectedCurrency(),
    getExchangeRates(),
  ])

  // التحقق من وجود الماركة في قاعدة البيانات
  if (!productsResult.success && productsResult.error === "BRAND_NOT_FOUND") {
    notFound()
  }

  const products =
    productsResult.success && productsResult.data ? productsResult.data : []

  // حساب سعر الصرف المقابل للعملة الحالية
  const currentRate =
    exchangeRates.find((r) => r.currency_code === selectedCurrency)
      ?.rate_from_usd ?? 1

  // استخراج اسم الماركة من أول منتج إن وجد، أو من الـ slug كقيمة احتياطية
  const brandName =
    products[0]?.brand_name || decodeURIComponent(slug).replace(/-/g, " ")

  return (
    <div className="w-full pt-2 pb-8 sm:pt-4 sm:pb-12">
      {/* شريط مسار التصفح والرجوع مطابق تماماً لعرض وحواشي الناف بار */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
            >
              <Link href={`/${locale}`} aria-label="Back">
                <ArrowLeftIcon className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
            <h1 className="text-lg font-bold tracking-tight text-foreground capitalize sm:text-2xl">
              {brandName}
            </h1>
          </div>

          <span className="text-xs text-muted-foreground sm:text-sm">
            {products.length} products
          </span>
        </div>
      </div>

      {/* عرض المنتجات عبر الـ Grid أو رسالة فارغة */}
      {products.length > 0 ? (
        <ProductsGrid
          title=""
          products={products}
          currency={selectedCurrency}
          exchangeRate={currentRate}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <PackageXIcon className="size-7" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
            No products found
          </h2>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground sm:text-sm">
            There are no products listed under this brand right now.
          </p>
          <Button
            asChild
            variant="secondary"
            className="mt-5 rounded-full text-xs"
          >
            <Link href={`/${locale}`}>Browse all sections</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
