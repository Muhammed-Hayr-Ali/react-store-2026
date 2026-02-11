// components/cart/CartItemCard.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { type CartItem } from "@/types";
import { removeItem, updateItemQuantity } from "@/lib/actions/cart";
import { X, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/provider/cart-provider";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  // ✅ الخطوة 1: إنشاء حالتي انتقال منفصلتين
  const { refreshCart } = useCart();
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [isRemovePending, startRemoveTransition] = useTransition();

  const variant = item.product_variants;
  const product = variant?.products;

  if (!variant || !product) {
    return null;
  }

  const price = variant.discount_price ?? variant.price;

  const options =
    variant.variant_option_values
      ?.map((vov) => vov?.product_option_values?.value)
      .filter(Boolean)
      .join(" / ") || "";

  // ✅ الخطوة 2: استخدام startUpdateTransition لتحديث الكمية
  const handleQuantityChange = (newQuantity: number) => {
    startUpdateTransition(async () => {
      if (newQuantity < 1) return;
      await updateItemQuantity(item.id, newQuantity);
      toast.success("Cart updated");
      refreshCart();
    });
  };

  // ✅ الخطوة 3: استخدام startRemoveTransition للحذف
  const handleRemoveItem = () => {
    startRemoveTransition(async () => {
      await removeItem(item.id);
      toast.success("Item removed from cart");
      refreshCart();
    });
  };

  // ✅ الخطوة 4: دمج الحالتين لتعطيل الأزرار بشكل عام عند أي عملية
  const isProcessing = isUpdatePending || isRemovePending;

  return (
    <div className="flex gap-4 border-b pb-6">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
        <Image
          src={product.main_image_url || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-1"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link
              href={`/products/${product.slug}`}
              className="font-semibold hover:underline"
            >
              {product.name}
            </Link>
            <p className="text-sm text-muted-foreground">{options}</p>
          </div>
          <p className="font-semibold">${(price * item.quantity).toFixed(2)}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isProcessing || item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-3 font-semibold text-sm">
              {/* ✅ عرض أيقونة التحميل فقط عند تحديث الكمية */}
              {isUpdatePending ? <Spinner /> : item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isProcessing}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveItem}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-destructive"
          >
            {/* ✅ عرض أيقونة التحميل فقط عند الحذف */}
            {isRemovePending ? (
              <Spinner className="h-4 w-4 mr-1 " />
            ) : (
              <X className="h-4 w-4 mr-1" />
            )}
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
