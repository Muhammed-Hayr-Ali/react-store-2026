"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useFormatPrice } from "@/hooks/use-format-price";
import { addItemToCart } from "@/lib/actions/cart";
import { MiniProduct } from "@/lib/actions/wishlist";
import { useCartCount } from "@/lib/provider/cart-provider";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Star, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: MiniProduct;
  className?: string;
}

function AddToCartButton({ product }: { product: MiniProduct }) {
  const { refreshCount } = useCartCount();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (product.stock_quantity <= 0) {
      toast.error("عذراً، هذا المنتج نفذ من المخزون.");
      return;
    }

    setIsLoading(true);

    const { error } = await addItemToCart({
      variantId: product.variant_id,
      quantity: 1,
    });

    if (error) {
      toast.error("فشل الإضافة للسلة: " + error);
    } else {
      toast.success(`تم إضافة ${product.name} للسلة بنجاح!`);
      refreshCount();
    }

    setIsLoading(false);
  };

  return (
    <Button
      disabled={isLoading || product.stock_quantity <= 0}
      onClick={handleAddToCart}
      className="w-full gap-2"
    >
      <ShoppingCart className={cn("size-4", isLoading && "animate-spin")} />
      {isLoading ? "جاري الإضافة..." : "أضف للسلة"}
    </Button>
  );
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const locale = useLocale();
  const price = useFormatPrice(product.price, locale);
  const discountPrice = useFormatPrice(product.discount_price, locale);

  const hasDiscount =
    product.discountPercentage && product.discountPercentage > 0;
  const isOutOfStock = product.stock_quantity <= 0;
  const rating = product.average_rating || 0;
  const isFeatured = product.is_featured;

  return (
    <Card className={cn("relative w-full overflow-hidden p-0", className)}>
      {/* Image Section */}
      <div className="relative">
        {/* Dark Overlay */}
        <div
          className={cn(
            "absolute inset-0 z-10 bg-black/30 transition-all duration-300",
            isOutOfStock && "bg-black/60",
          )}
        />

        <AspectRatio ratio={16 / 9}>
          <img
            src={product.main_image_url || "/placeholder.svg"}
            alt={product.name}
            className={cn(
              "relative z-20 size-full object-cover",
              "transition-all duration-500",
              "brightness-70 grayscale-[30%]",
              "group-hover/card:brightness-100 group-hover/card:grayscale-0",
              isOutOfStock && "grayscale brightness-50",
            )}
            loading="lazy"
          />
        </AspectRatio>

        {/* Featured Badge - CardAction */}
        {isFeatured && (
          <div className="absolute top-3 right-3 z-30">
            <Badge variant="secondary" className="shadow-md">
              <Star className="mr-1 size-3 fill-amber-500 text-amber-500" />
              مميز
            </Badge>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-30">
            <Badge variant="destructive" className="font-bold shadow-md">
              خصم {product.discountPercentage}%
            </Badge>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-bold shadow-lg"
            >
              نفذ من المخزون
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3">
        <CardAction>
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating}</span>
              {product.total_reviews !== undefined && (
                <span className="text-xs text-muted-foreground">
                  ({product.total_reviews})
                </span>
              )}
            </div>
          )}
        </CardAction>

        <CardTitle className="line-clamp-2">{product.name}</CardTitle>

        {product.short_description && (
          <CardDescription className="line-clamp-2">
            {product.short_description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-3">
        {/* Price */}
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-xl font-bold text-primary">
                {discountPrice}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {price}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary">{price}</span>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
