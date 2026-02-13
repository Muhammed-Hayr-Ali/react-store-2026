import { getCart } from "@/lib/actions/cart";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getUserAddresses, UserAddress } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const [
    { data: cart, error: cartError },
    { data: userAddresses, error: userAddressesError },
  ] = await Promise.all([getCart(), getUserAddresses()]);

  if (cartError || !cart || cart.cart_items.length === 0) {
    redirect("/dashboard/cart");
  }

  let addresses: UserAddress[] = [];

  if (userAddressesError || !userAddresses) {
    addresses = [];
  } else {
    addresses = userAddresses;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold">Shipping Details</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12 py-6">
        {/* <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 py-6"> */}
        <div className="order-2 lg:order-1 lg:col-span-2 ">
          <CheckoutForm savedAddresses={addresses} />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-1">
          <OrderSummary cart={cart} />
        </div>
      </div>
    </div>
  );
}
