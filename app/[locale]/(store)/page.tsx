import { cookies } from "next/headers"

import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import CategoriesScroll from "@/components/store/home/categories-scroll"
import { FlashSaleSection } from "@/components/store/flash-sale/flash-sale-section"
import ProductsGrid from "@/components/store/home/products-grid"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getFeaturedProductSlides } from "@/lib/actions/products/queries/get-featured-slides"
import { getRootCategories } from "@/lib/actions/categories/queries/get-root-categories"
import { getLatestProducts } from "@/lib/actions/products/queries/get-latest-products"
import { getActiveFlashSale } from "@/lib/actions/flash-sales/queries/get_active_flash_sale"

// استيراد أدوات جلب العملة وأسعار الصرف
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get_selected_currency"
import { getExchangeRates } from "@/lib/actions/currency/queries/get-rates"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Store",
    description:
      "Welcome to your Marketna store! Access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default async function Page() {
  // جلب كافة البيانات في السيرفر بالتوازي لتحقيق أعلى سرعة تحميل
  const [
    featuredResult,
    categoriesResult,
    latestResult,
    activeFlashSale,
    selectedCurrency,
    exchangeRates,
  ] = await Promise.all([
    getFeaturedProductSlides({ limit: 5 }),
    getRootCategories({ activeOnly: true }),
    getLatestProducts({ limit: 20, activeOnly: true }),
    getActiveFlashSale(),
    getSelectedCurrency(),
    getExchangeRates(),
  ])

  const slides =
    featuredResult.success && featuredResult.data ? featuredResult.data : []
  const categories =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : []
  const latestProducts =
    latestResult.success && latestResult.data ? latestResult.data : []

  // حساب سعر الصرف المقابل للعملة الحالية
  const currentRate =
    exchangeRates.find((r) => r.currency_code === selectedCurrency)
      ?.rate_from_usd ?? 1

  const cookieStore = await cookies()
  const viewModeCookie = cookieStore.get("product_view_mode")?.value
  const initialViewMode = (viewModeCookie === "list" ? "list" : "grid") as
    "grid" | "list"

  return (
    <div className="flex w-full flex-col pt-4">
      {/* تمرير العملة وسعر الصرف للسلايدر */}
      {slides.length > 0 && (
        <section aria-label="Featured Products" className="w-full">
          <FeaturedHeroSlider
            slides={slides}
            currency={selectedCurrency}
            exchangeRate={currentRate}
          />
        </section>
      )}

      {/* شريط تمرير التصنيفات */}
      {categories.length > 0 && (
        <section aria-label="Product Categories" className="w-full">
          <CategoriesScroll categories={categories} />
        </section>
      )}

      {/* قسم البيع السريع (يظهر تلقائياً فقط إذا كان هناك عرض سارٍ) */}
      {activeFlashSale && activeFlashSale.products.length > 0 && (
        <FlashSaleSection
          sale={activeFlashSale}
          currency={selectedCurrency}
          exchangeRate={currentRate}
        />
      )}

      {/* شبكة أحدث المنتجات */}
      {latestProducts.length > 0 && (
        <ProductsGrid
          title="Latest Products"
          products={latestProducts}
          currency={selectedCurrency}
          exchangeRate={currentRate}
          initialViewMode={initialViewMode}
        />
      )}
    </div>
  )
}
