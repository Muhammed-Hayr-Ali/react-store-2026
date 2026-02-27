"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { AspectRatio } from "../ui/aspect-ratio";
import { Spinner } from "../ui/spinner";
import { ProcessedProduct } from "@/lib/actions/recent-products";
import { useCartCount } from "@/lib/provider/cart-provider";
import { motion } from "framer-motion";
import { addItemToCart } from "@/lib/actions/cart";

interface RecentProductsProps {
  products: ProcessedProduct[];
  isLoading?: boolean;
  error?: string | null;
  basePath?: string;
}

// 3. تعريف متغيرات الحركة (مع استخدام as const لتجنب أخطاء TypeScript)
const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
} as const;

function AddToCartButton({ product }: { product: ProcessedProduct }) {
  const router = useRouter();
  const { refreshCount } = useCartCount();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock_quantity <= 0) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }
    setIsAdding(true);
    const { error } = await addItemToCart({
      variantId: product.variant_id,
      quantity: 1,
    });
    if (error) {
      if (error === "AUTHENTICATION_FAILED") {
        router.push("/auth/login");
      } else {
        toast.error("Failed to add to cart: " + error);
      }
    } else {
      toast.success(`${product.name} added to cart successfully!`);
      refreshCount();
    }
    setIsAdding(false);
  };

  return (
    <Button
      size="icon-sm"
      className="cursor-pointer"
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? <Spinner /> : <ShoppingCart />}
    </Button>
  );
}

// ================================================================================
// Product Card
// ================================================================================
function ProductCard({
  product,
  basePath = "/products",
}: {
  product: ProcessedProduct;
  basePath?: string;
}) {
  const router = useRouter(); // ✅ استخدام الروتر داخلياً

  const handleView = () => {
    router.push(`${basePath}/${product.slug}`);
  };

  return (
    <Card
      onClick={handleView}
      key={product.slug}
      className=" h-full overflow-hidden  p-1  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gap-3 cursor-pointer"
    >
      <AspectRatio
        key={product.id}
        ratio={1 / 1}
        className="relative bg-muted overflow-hidden rounded-lg"
      >
        {product.discountPercentage && (
          <Badge variant="default" className="absolute top-2 left-2 z-10">
            Discount {`${product.discountPercentage}%`}
          </Badge>
        )}
        <img
          src={product.main_image_url || "/placeholder.svg"}
          alt="Photo"
          className=" object-cover object-center h-full w-full"
        />
      </AspectRatio>
      <CardHeader className="px-2 pt-2">
        <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
        {product.total_reviews > 0 && (
          <CardAction>
            <Badge variant="secondary">
              <div className="flex items-center gap-1 text-sm text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-muted-foreground">
                  {product.average_rating}
                </span>
              </div>
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardDescription className="px-2 grow">
        {product.short_description}
      </CardDescription>
      <CardFooter className="flex justify-between items-center px-2 pb-2 ">
        <div className="space-x-2">
          {product.discount_price ? (
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-primary">
                ${product.discount_price}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ${product.price}
              </span>
            </div>
          ) : (
            <span className="font-bold">${product.price}</span>
          )}
        </div>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}

// ================================================================================
// المكون الرئيسي
// ================================================================================
export function RecentProducts({
  products,
  isLoading = false,
  error = null,
  basePath = "/products",
}: RecentProductsProps) {
  if (error)
    return (
      <div className="p-8 text-center text-destructive">
        {/* Failed to load products */}
      </div>
    );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!products?.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-background/50">
      <div className="container mx-auto space-y-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="flex items-center justify-between"
        >
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
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {products.map((product) => (
            <motion.div
              key={product.slug}
              variants={FADE_UP_ANIMATION_VARIANTS}
            >
              <ProductCard product={product} basePath={basePath} />
            </motion.div>
          ))}
        </motion.div>{" "}
      </div>
    </section>
  );
}
