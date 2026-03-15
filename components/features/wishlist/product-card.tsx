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
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShoppingCart, Trash, CheckCircle2, Store } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { StarIcon } from "@/components/shared/icons";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { memo } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductCardProps {
  product: MiniProduct;
  className?: string;
}

function AddToCartButton({ product }: { product: MiniProduct }) {
  const { refreshCount } = useCartCount();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (product.stock_quantity <= 0) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }

    setIsLoading(true);

    const { error } = await addItemToCart({
      variantId: product.variant_id,
      quantity: 1,
    });

    if (error) {
      toast.error("Failed to add to cart: " + error);
    } else {
      toast.success(`${product.name} added to cart successfully!`);
      refreshCount();
    }

    setIsLoading(false);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          disabled={isLoading || product.stock_quantity <= 0}
          onClick={handleAddToCart}
          size="icon"
          className="rounded-full shrink-0 transition-transform hover:scale-105"
          aria-label={`Add ${product.name} to cart`}
        >
          {isLoading ? <Spinner /> : <ShoppingCart className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Add to cart</p>
      </TooltipContent>
    </Tooltip>
  );
}

function RemoveFromWishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveFromWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    const { error } = await removeFromWishlist(productId);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Removed from wishlist");
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-xs"
          className={cn(
            "absolute z-40 top-2 right-2 bg-destructive hover:bg-destructive/80 text-white transition-opacity",
            className,
          )}
          onClick={handleRemoveFromWishlist}
          aria-label="Remove from wishlist"
        >
          {isLoading ? <Spinner /> : <Trash className="size-3" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Remove from wishlist</p>
      </TooltipContent>
    </Tooltip>
  );
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const price = useFormatPrice(product.price, locale);
  const discountPrice = useFormatPrice(product.discount_price, locale);

  const hasDiscount =
    product.discountPercentage && product.discountPercentage > 0;
  const isOutOfStock = product.stock_quantity <= 0;

  if (!product) {
    return null;
  }

  const handleViewProduct = () => {
    startTransition(() => {
      router.push(`/products/${product.slug}`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleViewProduct();
    }
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "relative mx-auto w-full max-w-sm flex flex-col pt-0 pb-3 gap-1.5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isPending && "opacity-50 pointer-events-none",
          className,
        )}
        onClick={handleViewProduct}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name} details`}
      >
        <Image
          src={product.main_image_url || "/placeholder.svg"}
          alt={product.name}
          width={400}
          height={225}
          sizes="(max-width: 640px) 100vw, 400px"
          loading="lazy"
          className="relative z-20 aspect-4/3 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <RemoveFromWishlistButton productId={product.id} />

        <CardHeader className="px-4 py-2">
          <CardAction>
            {hasDiscount && (
              <Badge
                variant="secondary"
                className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
              >
                OFF {product.discountPercentage}%
              </Badge>
            )}
            {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
          </CardAction>

          {/* Vendor Info */}
          {product.vendor_store_name && (
            <Link
              href={`/vendors/${product.vendor_id}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
            >
              {product.vendor_logo_url ? (
                <Image
                  src={product.vendor_logo_url}
                  alt={product.vendor_store_name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <Store className="size-4 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-muted-foreground hover:underline">
                {product.vendor_store_name}
              </span>
              {product.is_vendor_verified && (
                <CheckCircle2 className="size-3 text-blue-500" />
              )}
            </Link>
          )}

          <CardTitle className="line-clamp-2">{product.name}</CardTitle>
          <div className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
            {product.average_rating}
            <StarIcon className="size-3" />
            <Separator orientation="vertical" className="h-3" />
            {product.category}
            <Separator orientation="vertical" className="h-3" />
            {product.brand}
          </div>

          <CardDescription className="line-clamp-2 mt-2 min-h-10">
            {product.short_description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto px-4">
          <div className="w-full flex items-center justify-between">
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
    </TooltipProvider>
  );
};

export default memo(ProductCard);
