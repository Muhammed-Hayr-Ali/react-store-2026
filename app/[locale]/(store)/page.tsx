// app\[locale]\(store)\page.tsx

import { createMetadata } from "@/lib/metadata";
import { Hero } from "@/components/landing/hero";
import { FeaturedCategories } from "@/components/landing/featured-categories";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { NewsletterSignup } from "@/components/landing/newsletter-signup";
import { SpecialOffers } from "@/components/special-offers/SpecialOffers";
import { RecentProductsServer } from "@/components/recent-products/recent-products-server";
import { BestSellingProductsServer } from "@/components/best_selling_products/best_selling_products-server";

export function generateMetadata() {
  return createMetadata({
    title: "Store",
    description: "Marketna Store Page",
  });
}

export default function Page() {
  return (
    <main className="container mx-auto px-4">
      <Hero />
      <RecentProductsServer />
      <FeaturedCategories />
      <BestSellingProductsServer />
      <SpecialOffers />
      <WhyChooseUs />
      <NewsletterSignup />
    </main>
  );
}
