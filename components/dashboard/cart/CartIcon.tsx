// components/cart/CartIcon.tsx

"use client";

import Link from "next/link";
import { useCart } from "@/lib/provider/cart-provider";
import { CartButton } from "@/components/custom-ui/cart_button";

export function CartIcon() {
  const { cart, loading } = useCart();

  // ✅ ======================= التصحيح الرئيسي هنا =======================
  // نستخدم reduce لجمع الكميات (quantity) من كل عنصر في السلة
  const totalQuantity =
    cart?.cart_items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  // =================================================================

  return (
    <Link href="/account/cart" className="relative p-2">
      <CartButton count={totalQuantity} isloading={loading} />
    </Link>
  );
}
