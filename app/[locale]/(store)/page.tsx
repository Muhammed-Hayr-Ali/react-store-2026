// app\[locale]\(store)\page.tsx

import { createMetadata } from "@/lib/metadata";
import { Hero } from "@/components/landing/hero";
import { FeaturedCategories } from "@/components/landing/featured-categories";
import { BestSellers } from "@/components/landing/best-sellers";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { NewsletterSignup } from "@/components/landing/newsletter-signup";
import { SpecialOffers } from "@/components/special-offers/SpecialOffers";
import { NewlyAddedProducts } from "@/components/landing/newly-added-products/min";

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
      <NewlyAddedProducts />
      <FeaturedCategories />
      <BestSellers />
      <SpecialOffers />
      <WhyChooseUs />
      <NewsletterSignup />
    </main>
  );
}
