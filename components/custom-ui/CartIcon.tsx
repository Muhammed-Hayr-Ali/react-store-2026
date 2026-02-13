// components/cart/CartIcon.tsx

"use client";

import Link from "next/link";
import { CartButton } from "@/components/custom-ui/cart_button";
import { useCartCount } from "@/lib/provider/cart-provider";





export function CartIcon() {
  const { count, loading  } = useCartCount();

  return (
    <Link href="/cart" className="relative p-2">
      <CartButton count={count} isloading={loading} />
    </Link>
  );
}
