"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useFormatPrice } from "@/hooks/use-format-price";
import { addItemToCart } from "@/lib/actions/cart";
import { MiniProduct, removeFromWishlist } from "@/lib/actions/wishlist";
import { useCartCount } from "@/lib/provider/cart-provider";
import { useLocale } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { CircleX, ShoppingCart } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { StarIcon } from "@/components/shared/icons";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
      size="icon"
      className="rounded-full shrink-0"
    >
      {isLoading ? <Spinner /> : <ShoppingCart className="size-4" />}
    </Button>
  );
}

function RemoveFromWishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const routre = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveFromWishlist = async () => {
    setIsLoading(true);
    const { error } = await removeFromWishlist(productId);
    if (error) {
      toast.error(error);
    } else {
      routre.refresh();
    }
    setIsLoading(false);
  };

  return (
    <Button
      size="icon"
      variant="destructive"
      className={cn("absolute z-50 top-2 right-2", className)}
      onClick={handleRemoveFromWishlist}
    >
      {isLoading ? <Spinner /> : <CircleX className="size-4" />}
    </Button>
  );
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const routre = useRouter();
  const locale = useLocale();
  const price = useFormatPrice(product.price, locale);
  const discountPrice = useFormatPrice(product.discount_price, locale);

  const hasDiscount =
    product.discountPercentage && product.discountPercentage > 0;

  if (!product) {
    return null;
  }

  const handleViewProduct = () => {
    routre.push(`/products/${product.slug}`);
  };

  return (
    <Card
      className={cn(
        "relative mx-auto w-full max-w-sm flex flex-col pt-0 pb-3 gap-1.5",
        className,
      )}
      onClick={handleViewProduct}
    >
      <Image
        src={product.main_image_url || "/placeholder.svg"}
        alt={product.name}
        width={400}
        height={225}
        className="relative z-20 aspect-4/3  w-full object-cover"
      />

      <RemoveFromWishlistButton productId={product.id} />

      <CardHeader className="px-4 py-2">
        <CardAction>
          {hasDiscount && (
            <Badge variant="secondary">OFF {product.discountPercentage}%</Badge>
          )}
        </CardAction>
        <CardTitle>{product.name}</CardTitle>
        <CardTitle className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
          {product.average_rating}
          <StarIcon className="size-3" />
          <Separator orientation="vertical" />
          {product.category}
          <Separator orientation="vertical" />
          {product.brand}
        </CardTitle>

        <CardDescription className="line-clamp-2 mt-2">
          {product.short_description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto px-4">
        <div className=" w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">{price}</span>
            {hasDiscount && (
              <span className="text-sm font-medium line-through text-muted-foreground">
                {discountPrice}
              </span>
            )}
          </div>
          <AddToCartButton product={product} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
