// app/(store)/cart/page.tsx

import CartPage from "@/components/cart/CartPage";
import { getCart } from "@/lib/actions";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Your Shopping Cart",
  description:
    "Review the items in your shopping cart and proceed to checkout.",
});

export default async function Page() {
  const { data: cart } = await getCart();
  const items = cart?.cart_items || [];

  return <CartPage cartItems={items} />;
}
