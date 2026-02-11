// app/(store)/cart/page.tsx

import Cart from "@/components/dashboard/cart/CartPage";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Your Shopping Cart",
  description:
    "Review the items in your shopping cart and proceed to checkout.",
});

export default function Page() {
  return <Cart />;
}
