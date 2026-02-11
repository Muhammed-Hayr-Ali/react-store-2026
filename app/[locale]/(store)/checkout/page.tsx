import { getCart } from "@/lib/actions/cart";
import { redirect } from "next/navigation";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getUserAddresses } from "@/lib/actions";

export default async function CheckoutPage() {
  const cart = await getCart();
  if (!cart || cart.cart_items.length === 0) {
    redirect("/cart");
  }

  // ✅ جلب عناوين المستخدم
  const addresses = await getUserAddresses();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold mb-6">Shipping Details</h1>

          <CheckoutForm savedAddresses={addresses} />
        </div>

          <OrderSummary cart={cart} />
      </div>
    </div>
  );
}
