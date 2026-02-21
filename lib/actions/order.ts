"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/actions/email";
import { createServerClient } from "../supabase/createServerClient";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import { revalidatePath } from "next/cache";
import { getUser } from "./get-user-action";
import { CartItem } from "@/types";
import { siteConfig } from "../config/site";

//=====================================================================
// Order item details Types
//=====================================================================
export type OrderItemWithDetails = {
  id: string;
  quantity: number;
  price_at_purchase: number;
  product_name: string;
  variant_options: string | null;
};

//=====================================================================
// Order with details Types
export type OrderWithDetails = {
  id: string;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  taxes: number;
  total_amount: number;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  order_items: OrderItemWithDetails[];
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

//=====================================================================
// Create Order
//=====================================================================
export async function createOrder(
  selectedAddressId: string,
): Promise<ApiResponse<string>> {
  // Create both regular and admin Supabase clients
  const supabase = await createServerClient();
  // Use admin client for order creation to bypass RLS and ensure data integrity
  const adminSupabase = createAdminClient();

  // Get User ID
  const { data: user, error: userError } = await getUser();

  // If there's an error fetching the user or no user is found, return an error response
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "You must be logged in to place an order." };
  }

  // Get Cart Items and Cart Details
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*, cart_items(*, product_variants(*, products(*)))")
    .eq("user_id", user.id)
    .single();

  // If there's an error fetching the cart, or if the cart is empty, return an error response
  if (cartError || !cart || cart.cart_items.length === 0) {
    console.error("Error fetching cart:", cartError);
    return {
      error: "Please add items to your cart before creating an order.",
    };
  }

  // Get Address Details to be saved in the order record
  const { data: address, error: addressError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("id", selectedAddressId)
    .eq("user_id", user.id)
    .single();

  // If there's an error fetching the address, or if the address is not found, return an error response
  if (addressError || !address) {
    console.error("Address Error:", addressError);
    return {
      error: "Please select a valid address.",
    };
  }

  // Calculate Order Details
  const subtotal = cart.cart_items.reduce((acc: number, item: CartItem) => {
    const variant = item.product_variants!;
    const price = variant.discount_price ?? variant.price ?? 0;

    return acc + price * item.quantity;
  }, 0);

  // Calculate Order Details
  const shippingCost = siteConfig.shippingCost;
  const taxes = subtotal * siteConfig.taxes;
  const totalAmount = subtotal + shippingCost + taxes;

  // Insert Order Using Admin Supabase
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
    console.error("Error creating order:", cartError);
    return {
      error: "Failed to create the order.",
    };
  }

  // Insert Order Items
  const orderItems = cart.cart_items.map((item: CartItem) => {
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
    console.error("Error creating order items:", itemsError);
    return {
      error: "Failed to create the order items.",
    };
  }

  // Try to send the order confirmation email
  try {
    const { data: fullOrderDetails } = await adminSupabase
      .from("orders")
      .select(`*, order_items(*)`)
      .eq("id", newOrder.id)
      .single<OrderWithDetails>();

    if (fullOrderDetails) {
      await sendEmail({
        to: user.email!,
        subject: `Your Marketna Order Confirmation #${newOrder.id.substring(0, 8)}`,
        react: OrderConfirmationEmail({ order: fullOrderDetails }),
      });
    }
  } catch (error) {
    console.error("Failed to send email.", error);
    return {
      error: "Failed to send the order confirmation email.",
    };
  }
  // =================================================================

  // Delete Cart
  await adminSupabase.from("carts").delete().eq("id", cart.id);
  revalidatePath("/cart");

  return {
    data: newOrder.id,
  };
}

//=====================================================================
// Get Order Details
//=====================================================================
export async function getOrderDetails(
  orderId: string,
): Promise<ApiResponse<OrderWithDetails | null>> {
  const supabase = await createServerClient();

  // Get User ID
  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "You must be logged in to place an order." };
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
      error: "Failed to fetch order details.",
    };
  }

  return {
    data: order,
  };
}
