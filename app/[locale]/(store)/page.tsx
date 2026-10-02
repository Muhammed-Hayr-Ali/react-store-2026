import StorePage from "@/components/store/home/StorePage"
import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getFeaturedProductSlides } from "@/lib/actions/products/queries/get-featured-slides"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Store",
    description:
      "Welcome to your Marketna store! Access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default async function Page() {
  // جلب بيانات السلايدر في جانب الخادم
  const result = await getFeaturedProductSlides({ limit: 5 })
  const slides = result.success && result.data ? result.data : []

  return (
    <div className="flex w-full flex-col">
      {/* سلايد شو المنتجات المتميزة */}
      {slides.length > 0 && (
        <section aria-label="Featured Products" className="w-full">
          <FeaturedHeroSlider slides={slides} />
        </section>
      )}

      {/* باقي أقسام المتجر */}
      <StorePage />
    </div>
  )
}
