"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/actions/email";
import { createServerClient } from "../supabase/createServerClient";
import { CartWithDetails, ResponseStatus } from "../types";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import { OrderWithDetails } from "../types/order";

//=====================================================================
// Create Order
//=====================================================================
export async function createOrder(selectedAddressId: string): Promise<ResponseStatus> { 

  const supabase = await createServerClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Authentication Error",
      message: "You must be logged in to place an order.",
    };
  }

  // 2. جلب السلة
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*, cart_items(*, product_variants(*, products(*)))")
    .eq("user_id", user.id)
    .single<CartWithDetails>();

  if (cartError || !cart || cart.cart_items.length === 0) {
    return {
      success: false,
      error: "Cart Error",
      message: "Please add items to your cart before creating an order.",
    };
  }

  // 3. جلب العنوان
  const { data: address, error: addressError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("id", selectedAddressId)
    .eq("user_id", user.id)
    .single();

  if (addressError || !address) {
    return {
      success: false,
      error: "Address Error",
      message: "Please select a valid address.",
    };
  }

  // 4. حساب الأسعار
  const subtotal = cart.cart_items.reduce((acc, item) => {
    const price =
      item.product_variants?.discount_price ??
      item.product_variants?.price ??
      0;
    return acc + price * item.quantity;
  }, 0);
  const shippingCost = 5.0;
  const taxes = subtotal * 0.1;
  const totalAmount = subtotal + shippingCost + taxes;

  const { data: newOrder, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      user_id: user.id,
      customer_email: user.email!,
      shipping_address: address,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      taxes: taxes,
      total_amount: totalAmount,
    })
    .select()
    .single();

  if (orderError || !newOrder) {
    return {
      success: false,
      error: "Order Error",
      message: "Failed to create the order.",
    };
  }

  // 6. تحضير وإضافة عناصر الطلب
  const orderItems = cart.cart_items.map((item) => {
    const variant = item.product_variants!;
    const product = variant.products!;
    return {
      order_id: newOrder.id,
      product_variant_id: variant.id,
      product_name: product.name,
      variant_options: "N/A",
      quantity: item.quantity,
      price_at_purchase: variant.discount_price ?? variant.price,
    };
  });

  const { error: itemsError } = await adminSupabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return {
      success: false,
      error: "Order Items Error",
      message: "Failed to create the order items.",
    };
  }

  // =================================================================
  // ✅ الخطوة الجديدة: إرسال بريد إلكتروني للتأكيد
  // =================================================================
  try {
    // جلب الطلب الكامل مع تفاصيله لتمريره إلى قالب البريد الإلكتروني
    const { data: fullOrderDetails } = await adminSupabase
      .from("orders")
      .select(`*, order_items(*)`)
      .eq("id", newOrder.id)
      .single<OrderWithDetails>();

    if (fullOrderDetails) {
      await sendEmail({
        to: user.email!,
        subject: `Your Marketna Order Confirmation #${newOrder.id.substring(0, 8)}`, // ✅ تم تحديث الموضوع
        react: OrderConfirmationEmail({ order: fullOrderDetails }),
      });
    }
  } catch {
    return {
      success: false,
      error: "Email Error",
      message: "Failed to send the order confirmation email.",
    };
  }
  // =================================================================

  // 8. حذف السلة
  await adminSupabase.from("carts").delete().eq("id", cart.id);

  // 9. إعادة التوجيه
  redirect(`/order-confirmation?order_id=${newOrder.id}`);
}

//=====================================================================
// Get Order Details
//=====================================================================
export async function getOrderDetails(
  orderId: string,
): Promise<ResponseStatus<OrderWithDetails | null>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "User Error",
      message: "User not found.",
    };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      status,
      subtotal,
      shipping_cost,
      taxes,
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
    .eq("user_id", user.id)
    .single<OrderWithDetails>();

  if (error) {
    console.error("Failed to fetch order details:", error);
    return {
      success: false,
      error: "Order Error",
      message: "Failed to fetch order details.",
    };
  }

  return {
    success: true,
    data: order,
  };
}
