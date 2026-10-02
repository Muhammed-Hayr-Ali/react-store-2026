import StorePage from "@/components/store/home/StorePage"
import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import CategoriesScroll from "@/components/store/home/categories-scroll"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getFeaturedProductSlides } from "@/lib/actions/products/queries/get-featured-slides"
import { getRootCategories } from "@/lib/actions/categories/queries/get-root-categories"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Store",
    description:
      "Welcome to your Marketna store! Access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default async function Page() {
  // 1. جلب بيانات السلايدر والتصنيفات بالتوازي لتحسين سرعة الاستجابة
  const [featuredResult, categoriesResult] = await Promise.all([
    getFeaturedProductSlides({ limit: 5 }),
    getRootCategories({ activeOnly: true }),
  ])

  const slides =
    featuredResult.success && featuredResult.data ? featuredResult.data : []
  const categories =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : []

  return (
    <div className="flex w-full flex-col">
      {/* سلايد شو المنتجات المتميزة */}
      {slides.length > 0 && (
        <section aria-label="Featured Products" className="w-full">
          <FeaturedHeroSlider slides={slides} />
        </section>
      )}

      {/* شريط تمرير التصنيفات */}
      {categories.length > 0 && (
        <section aria-label="Product Categories" className="w-full">
          <CategoriesScroll categories={categories} />
        </section>
      )}

      {/* باقي محتوى المتجر */}
      <StorePage />
    </div>
  )
}
