import Link from "next/link";
import { OrderSummary } from "./OrderSummary";
import { CartItem } from "@/lib/actions";
import { CartItemCard } from "./CartItemCard";

export default async function CartPage({
  cartItems,
}: {
  cartItems: CartItem[];
}) {

  const items = cartItems;
  const subtotal = items.reduce((acc, item) => {
    const variant = item.product_variants;
    const price = variant.discount_price ?? variant?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);


  if (items.length === 0)
    return (
      <div className="flex flex-1 flex-col h-full items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground mt-2">
            Looks like you haven&#39;t added anything to your cart yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );

  // --- نهاية الجزء المعدل ---

  return (
    <main className="container mx-auto">
      <h1 className="text-3xl font-bold">Your Cart ({items.length})</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12 py-6">
        <div className="lg:col-span-2 space-y-6">
          {items &&
            items.map((item) => <CartItemCard key={item.id} item={item} />)}
        </div>
        <div className="lg:col-span-1">
          <OrderSummary subtotal={subtotal} />
        </div>
      </div>
    </main>
  );
}
