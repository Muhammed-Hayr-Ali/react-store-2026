import { MiniProduct } from "@/lib/actions/get-all-mini-products";
import { motion } from "framer-motion";
import { ProductCard } from "./recent-products";
import { Button } from "../ui/button";

interface Props {
  products: MiniProduct[];
  basePath: string;
}

// 3. تعريف متغيرات الحركة (مع استخدام as const لتجنب أخطاء TypeScript)
const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
} as const;

export async function RecentProductsServer({ products, basePath }: Props) {
  if (!products) {
    return null;
  }

  if (!products?.length) return null;

  return (
    <section className="container mx-auto py-10 sm:py-24 space-y-6">
      <div className=" flex justify-between items-center">
        <div>
          <h2
            id="new-products-heading"
            className="text-2xl md:text-3xl font-bold tracking-tight"
          >
            ✨ Latest Products
          </h2>
          <p className="text-muted-foreground mt-1">
            Discover our carefully curated new collection
          </p>
        </div>
        {/* زر عرض الكل (اختياري) */}
        <Button variant="ghost" className="hidden sm:flex items-center gap-1">
          <span>View All</span>
          <span className="text-xs">→</span>
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.slug}>
            <ProductCard product={product} basePath={basePath} />
          </div>
        ))}
      </div>
    </section>
  );
}
