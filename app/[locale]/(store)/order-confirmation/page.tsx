import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/createServerClient";
import { OrderWithDetails } from "@/lib/actions";

async function getOrderDetails(
  orderId: string,
): Promise<OrderWithDetails | null> {
  const supabase = await createServerClient();

  const { data: userResponse } = await supabase.auth.getUser();
  if (!userResponse.user) return null;

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      status,
      total_amount,
      shipping_address,
      order_items (
        id,
        quantity,
        price_at_purchase,
        product_name,
        variant_options
      )
    `,
    )
    .eq("id", orderId)
    .eq("user_id", userResponse.user.id)
    .single<OrderWithDetails>();

  if (error) {
    console.error("Failed to fetch order details:", error);
    return null;
  }

  return order;
}

// FIXED: Properly handle searchParams as a Promise
export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. AWAIT searchParams to resolve
  const resolvedParams = await searchParams;

  // 2. Safely extract order_id (handle array case per Next.js types)
  const orderIdParam = resolvedParams.order_id;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  // 3. Validate orderId is a valid string
  if (typeof orderId !== "string" || orderId.trim() === "") {
    notFound();
  }

  const order = await getOrderDetails(orderId);
  if (!order) {
    notFound();
  }

  const shipping = order.shipping_address;

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center border-b pb-8">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold">Thank you for your order!</h1>
        <p className="mt-2 text-muted-foreground">
          Your order has been placed successfully. A confirmation email has been
          sent.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Order ID: <span className="font-mono">{order.id}</span>
        </p>
      </div>

      <div className="py-8 space-y-8">
        {/* Order Items */}
        <div>
          <h2 className="text-xl font-semibold mb-4">What you ordered</h2>
          <div className="space-y-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  {item.variant_options && (
                    <p className="text-sm text-muted-foreground">
                      {Object.entries(item.variant_options)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.price_at_purchase * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping to</h2>
          <div className="text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="font-medium text-foreground">
              {shipping.first_name} {shipping.last_name}
            </p>
            <p>{shipping.address}</p>
            <p>
              {shipping.city}, {shipping.state} {shipping.zip}
            </p>
            <p>{shipping.country}</p>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center border-t pt-6 text-xl font-bold">
          <p>Total Paid</p>
          <p>${order.total_amount.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-center mt-8">
        {/* FIXED: Corrected typo in className (foreground) */}
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
