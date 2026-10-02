import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import CategoriesScroll from "@/components/store/home/categories-scroll"

import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getFeaturedProductSlides } from "@/lib/actions/products/queries/get-featured-slides"
import { getRootCategories } from "@/lib/actions/categories/queries/get-root-categories"
import { getLatestProducts } from "@/lib/actions/products/queries/get-latest-products"

// استيراد أدوات جلب العملة وأسعار الصرف
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get_selected_currency"
import { getExchangeRates } from "@/lib/actions/currency/queries/get-rates"
import ProductsGrid from "@/components/store/home/products-grid"

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
    selectedCurrency,
    exchangeRates,
  ] = await Promise.all([
    getFeaturedProductSlides({ limit: 5 }),
    getRootCategories({ activeOnly: true }),
    getLatestProducts({ limit: 20, activeOnly: true }),
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

  return (
    <div className="flex w-full flex-col">
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

      {/* شبكة أحدث المنتجات */}
      {latestProducts.length > 0 && (
        <ProductsGrid
          title="Latest Products"
          products={latestProducts}
          currency={selectedCurrency}
          exchangeRate={currentRate}
        />
      )}
    </div>
  )
}
