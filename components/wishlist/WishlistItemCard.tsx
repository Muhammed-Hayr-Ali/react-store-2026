"use client";

import { addItemToCart, removeFromWishlist, WishlistItem, WishlistProduct } from "@/lib/actions";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  calculateDiscountPercentage,
  getExpiryMessage,
} from "@/lib/actions/convert-functions";
import { useCartCount } from "@/lib/provider/cart-provider";




function AddToCartButton({
  state,
  calbackSetState,
  variantId,
  quantity,
}: {
  state: boolean;
  calbackSetState: (boolean: boolean) => void;
  variantId: string;
  quantity: number;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { refreshCount } = useCartCount();
  const handleAddToCart = async () => {
    if (quantity < 1 || !Number.isInteger(quantity) || !variantId) {
      toast.error("Add to cart failed. Invalid quantity or variant ID.");
      return;
    }

    setIsLoading(true);
    calbackSetState(true);
    const result = await addItemToCart({ variantId, quantity });
    if (result.error) {
      toast.error(result.error);
    } else {
      refreshCount();
      toast.success("Item added to cart successfully.");
    }
    setIsLoading(false);
    calbackSetState(false);
  };

  return (
    <Button
      size={"lg"}
      className="w-full h-10"
      type="submit"
      onClick={handleAddToCart}
      disabled={state || isLoading}

    >
      {isLoading ? <Spinner /> : "Add to Cart"}
    </Button>
  );
}


interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (productId: string) => void;
}

export default function WishlistItemCard({
  item,
  onRemove,
}: WishlistItemCardProps) {
  // Processing State
  const [isRemoving, startRemoveTransition] = useTransition();
  const [ isAddingToCart, setIsAddingToCart ] = useState<boolean>(false);
  const isProsessing = isRemoving || isAddingToCart;
  // Item Data
  const product: WishlistProduct = item.product;
  if (!product || !product.id) return null;
  const variant = product.variants[0];
  const hasDiscount = variant.discount_price && variant.price;
  const dscountPercentage = calculateDiscountPercentage(
    variant.discount_price || 0,
    variant.price,
  );
  const expiryMessage = getExpiryMessage(product.variants[0].discount_expires_at || "");

  


  const handleRemove = () => {
    startRemoveTransition(async () => {
      const result = await removeFromWishlist(product.id!);
      if (result.success) {
        toast.success(result.message);
        onRemove(product.id!);
      } else {
        toast.error(result.error);
      }
    });
  };




  return (
    <div className="relative group overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
      {/* --- Image Section with Discount Badge --- */}
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="block aspect-square"
        >
          <Image
            src={product.main_image_url || "/placeholder.svg"}
            alt={product.name!}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>
        {hasDiscount && (
          <Badge
            variant="default"
            className="absolute bg-red-600 top-3 right-3"
          >
            SALE {dscountPercentage}%
          </Badge>
        )}
        {/* --- Remove Button on Hover --- */}
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-3 left-3 h-8 w-8"
          onClick={handleRemove}
          disabled={isProsessing}
          aria-label="Remove from wishlist"
        >
          {isRemoving ? <Spinner /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* --- Details Section --- */}
      <div className="p-4 flex flex-col grow">
        <h3 className="font-semibold text-base leading-tight truncate mb-2">
          <Link href={`/products/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        {/* --- Price Section --- */}
        <div className="mt-1">
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-primary">
                  ${product.variants[0].discount_price!.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.variants[0].price!.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">
                ${product.variants[0].price?.toFixed(2) || "N/A"}
              </span>
            )}
          </div>

          {/* ✅ --- Expiry Date Added Here --- */}
          {expiryMessage && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-medium">
              {expiryMessage}
            </p>
          )}
        </div>

        {/* --- Add to Cart Button --- */}
        <div className="mt-auto pt-4">
          <AddToCartButton variantId={variant.id!} quantity={1} state={isProsessing} calbackSetState={setIsAddingToCart} />
        </div>
      </div>
    </div>
  );
}
