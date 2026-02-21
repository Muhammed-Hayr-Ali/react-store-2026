import Link from "next/link";
import { OrderSummary } from "./OrderSummary";
import { CartItemCard } from "./CartItemCard";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ShoppingCart,
} from "lucide-react";
import { CartItem } from "@/lib/actions";

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
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShoppingCart className="rtl:rotate-y-180"/>
          </EmptyMedia>
          <EmptyTitle>Your cart is empty</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            Looks like you have no items in your shopping cart.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Link
              href="/"
              className="flex gap-2 items-center rtl:flex-row-reverse"
            >
              <p> Continue Shopping</p>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );


  return (
    <main className="container mx-auto min-h-[50vh] px-4 mb-8">
      <h1 className="text-2xl font-bold">Your Cart ({items.length})</h1>
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
