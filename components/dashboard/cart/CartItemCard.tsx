// components/cart/CartItemCard.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { CartItem, removeItem, updateItemQuantity } from "@/lib/actions/cart";
import { X, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useCartCount } from "@/lib/provider/cart-provider";
// import { useCart } from "@/lib/provider/cart-provider";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  // React Hooks For Refreshing Cart
  const { refreshCount } = useCartCount();
  // Update and Remove State
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [isRemovePending, startRemoveTransition] = useTransition();

  // Item Data
  const variant = item.product_variants;
  const varintOptionValues = variant?.variant_option_values;
  const product = variant?.products;

  if (!variant || !product) {
    return null;
  }

  // Calculate Total
  const price = variant.discount_price ?? variant.price;

  // Calculate Options
  const options =
    varintOptionValues
      ?.map((vov) => vov?.product_option_values?.value)
      .filter(Boolean)
      .join(" / ") || "";

  // Update Item Quantity
  const handleQuantityChange = (newQuantity: number) => {
    startUpdateTransition(async () => {
      if (newQuantity < 1) return;
      const { data: updated, error: updateError } = await updateItemQuantity(
        item.id,
        newQuantity,
      );

      if (updateError || !updated) {
        toast.error("Failed to update quantity.");
        return;
      }

      // update cart state
      refreshCount();
    });
  };

  //  Remove Item From Cart
  const handleRemoveItem = () => {
    startRemoveTransition(async () => {
      const { data: removed, error: removeError } = await removeItem(item.id);

      if (removeError || !removed) {
        toast.error("Failed to remove item from cart.");
        return;
      }

      toast.success("Item removed from cart.");
      // update cart state
      refreshCount();
    });
  };

  // Check if update or remove is pending
  const isProcessing = isUpdatePending || isRemovePending;

  return (
    <div className="relative flex gap-4 mb-6 bg-background p-2 lg:p-4 rounded-lg">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md">
        <Image
          src={product.main_image_url || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-1"
        />
      </div>
      {/* ditails */}
      <div className="flex flex-1 justify-between  flex-col">
        {/* Product Name */}
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="font-semibold hover:underline"
          >
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">{options}</p>
        </div>

        <div className="flex items-center justify-between">
          {/* Price */}
          <p className="font-semibold">${(price * item.quantity).toFixed(2)}</p>

          {/* Quantity */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center rtl:flex-row-reverse bg-foreground  text-background rounded-full">
              <Button
                variant={"ghost"}
                size={"icon-xs"}
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isProcessing || item.quantity <= 1}
                className="hover:bg-transparent  text-background hover:text-background "
              >
                <Minus />
              </Button>
              <span className="font-semibold text-xs min-w-4 text-center">
                {isUpdatePending ? <Spinner /> : item.quantity}
              </span>
              <Button
                variant={"ghost"}
                size={"icon-xs"}
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isProcessing}
                className="hover:bg-transparent  text-background hover:text-background "
              >
                <Plus size={12} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Remove */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemoveItem}
        disabled={isProcessing}
        className="text-muted-foreground hover:bg-tr hover:text-destructive top-0 right-0 rtl:right-auto rtl:left-0 absolute"
      >
        <span className="hidden lg:block">Remove</span>
        {isRemovePending ? <Spinner /> : <X />}
      </Button>{" "}
    </div>
  );
}
