import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/createServerClient";
import { OrderWithDetails } from "@/lib/actions/order";
import OrderConfirmation from "@/components/order-confirmation/order-confirmation";

export const dynamic = "force-dynamic";

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

  return <OrderConfirmation order={order} />;
}
