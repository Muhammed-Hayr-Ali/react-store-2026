import { FullProduct } from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";



const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
} as const;




export default function ProductCard({ product }: { product: FullProduct }) {
  const image = product.main_image_url || "/placeholder.svg";
  const variant = product.variants.filter((variant) => variant.is_default)[0];

  const price = variant?.price ?? 0;
  const dscPrice = variant?.discount_price ?? null;

  return (
    <motion.div
      key={product.id}
      variants={FADE_UP_ANIMATION_VARIANTS}
      className="group relative flex flex-col bg-card border rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-xl"
    >
      {/* --- الصورة والشارة --- */}
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <Image
            src={image}
            alt={product.name}
            width={512}
            height={512}
            className="
                      w-full 
                      object-cover 
                      object-center 
                      aspect-square 
                      transition-transform 
                      duration-300 
                      group-hover:scale-105
                    "
          />
        </Link>
        <Badge variant="default" className="absolute top-3 right-3">
          Best Seller
        </Badge>
      </div>

      {/* --- تفاصيل المنتج --- */}
      <div className="p-4 flex flex-col grow">
        {/* <p className="text-sm text-muted-foreground">{product.brand}</p> */}
        <h3 className="mt-1 font-semibold text-lg leading-tight">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {/* التقييم */}
        {/* <div className="mt-2 flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-muted-foreground">
            {product.rating}
          </span>
        </div> */}

        {/* السعر وزر الإضافة للسلة */}
        <div className="mt-4 flex  justify-between grow items-end">
          {price &&<p className="text-xl font-bold text-foreground">{price}</p>}
          <Button size="icon" aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
