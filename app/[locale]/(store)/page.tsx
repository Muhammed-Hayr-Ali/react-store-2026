// app\[locale]\(store)\page.tsx

import { createMetadata } from "@/lib/metadata";
import { Hero } from "@/components/landing/hero";
import { FeaturedCategories } from "@/components/landing/featured-categories";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { NewsletterSignup } from "@/components/landing/newsletter-signup";
import { SpecialOffers } from "@/components/special-offers/SpecialOffers";
import { RecentProductsServer } from "@/components/recent-products/recent-products-server";
import { BestSellingProductsServer } from "@/components/best_selling_products/best_selling_products-server";
import FeaturedProductsServer from "@/components/featured-products/featured-products-server";
import { getAllMiniProducts } from "@/lib/actions/get-all-mini-products";

export function generateMetadata() {
  return createMetadata({
    title: "Store",
    description: "Marketna Store Page",
  });
}

export default async function Page() {
  const { data: miniProducts, error } = await getAllMiniProducts();

  if (error) {
    console.error("Error fetching mini products:", error);
    return <span>Error: {error}</span>;
  }

  const basePath = "/products";

  const featuredProducts = miniProducts?.featuredProducts || [];
  const recentProducts = miniProducts?.recentProducts || [];

  return (
    <main className="container mx-auto px-4 pt-8">
      {/* <Hero /> */}
      <FeaturedProductsServer basePath={basePath} products={featuredProducts} />
      <RecentProductsServer basePath={basePath} products={recentProducts} />
      {/*  <FeaturedCategories />
      <BestSellingProductsServer />
      <SpecialOffers />
      <WhyChooseUs />
      <NewsletterSignup /> */}
    </main>
  );
}
