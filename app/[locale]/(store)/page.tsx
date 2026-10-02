import StorePage from "@/components/store/home/StorePage"
import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import CategoriesScroll from "@/components/store/home/categories-scroll"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getFeaturedProductSlides } from "@/lib/actions/products/queries/get-featured-slides"
import { getRootCategories } from "@/lib/actions/categories/queries/get-root-categories"

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
  const [featuredResult, categoriesResult, selectedCurrency, exchangeRates] =
    await Promise.all([
      getFeaturedProductSlides({ limit: 5 }),
      getRootCategories({ activeOnly: true }),
      getSelectedCurrency(),
      getExchangeRates(),
    ])

  const slides =
    featuredResult.success && featuredResult.data ? featuredResult.data : []
  const categories =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : []

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

      {/* باقي أقسام المتجر */}
      <StorePage />
    </div>
  )
}
