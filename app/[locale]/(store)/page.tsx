// app\[locale]\(store)\page.tsx

import { createMetadata } from "@/lib/metadata";
import { getAllMiniProducts } from "@/lib/actions/get-all-mini-products";
import { Hero } from "@/components/features/landing/hero";
import FeaturedProductsServer from "@/components/features/featured-products/featured-products-server";
import { RecentProductsServer } from "@/components/features/recent-products/recent-products-server";
import { FeaturedCategories } from "@/components/features/landing/featured-categories";
import { BestSellingProductsServer } from "@/components/features/best_selling_products/best_selling_products-server";
import { SpecialOffers } from "@/components/features/special-offers/SpecialOffers";
import { WhyChooseUs } from "@/components/features/landing/why-choose-us";
import { NewsletterSignup } from "@/components/features/landing/newsletter-signup";

export function generateMetadata() {
  return createMetadata({
    title: "Store",
    description: "Marketna Store Page",
  });
}

export default function Page() {
  // const { data: miniProducts, error } = await getAllMiniProducts();

  // if (error) {
  //   console.error("Error fetching mini products:", error);
  //   return <span>Error: {error}</span>;
  // }

  // const basePath = "/products";

  // const featuredProducts = miniProducts?.featuredProducts || [];
  // const recentProducts = miniProducts?.recentProducts || [];

  return (
    <main className="container mx-auto px-4 ">
      <Hero />
      {/* <FeaturedProductsServer basePath={basePath} products={featuredProducts} />
      <RecentProductsServer basePath={basePath} products={recentProducts} /> */}
      <FeaturedCategories />
      <BestSellingProductsServer />
      <SpecialOffers />
      <WhyChooseUs />
      <NewsletterSignup />
    </main>
  );
}
