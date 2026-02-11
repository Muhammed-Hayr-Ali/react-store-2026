"use server";

import { unstable_noStore as noStore } from "next/cache";
import {
  AddressesSummary,
  CartSummary,
  DashboardSummary,
  OrdersSummary,
  ReviewsSummary,
  WishlistSummary,
} from "../types/account/dashboard-summary";
import { createServerClient } from "@/lib/supabase/createServerClient";

// ====================================================================
// Main Function
// ====================================================================
export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummary | null> {
  noStore();
  const [
    ordersSummary,
    cartSummary,
    wishlistSummary,
    reviewsSummary,
    addressesSummary,
  ] = await Promise.all([
    getOrdersSummary(userId),
    getCartSummary(userId),
    getWishlistSummary(userId),
    getReviewsSummary(userId),
    getAddressesSummary(userId),
  ]);

  return {
    ordersSummary,
    cartSummary,
    wishlistSummary,
    reviewsSummary,
    addressesSummary,
  };
}

// ====================================================================
//  Get Orders Summary
// ====================================================================
async function getOrdersSummary(userId: string): Promise<OrdersSummary> {
  const supabase = await createServerClient();
  const [countResult, latestOrderResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("orders")
      .select("id, status, created_at, total_amount")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  return {
    totalOrders: countResult.count ?? 0,
    latestOrder: latestOrderResult.data,
  };
}

// ====================================================================
//  Get Cart Summary
// ====================================================================
async function getCartSummary(userId: string): Promise<CartSummary> {
  const supabase = await createServerClient();
  const { data: cart, error } = await supabase
    .from("carts")
    .select(
      `cart_items(quantity,variant:product_variants!inner(price,discount_price))`,
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !cart || !cart.cart_items)
    return { totalItems: 0, totalPrice: 0 };
  const typedCartItems = cart.cart_items as unknown as {
    quantity: number;
    variant: { price: number; discount_price: number | null } | null;
  }[];
  let totalItems = 0,
    totalPrice = 0;
  for (const item of typedCartItems) {
    if (item.variant) {
      totalItems += item.quantity;
      const price = item.variant.discount_price ?? item.variant.price ?? 0;
      totalPrice += price * item.quantity;
    }
  }
  return { totalItems, totalPrice };
}

// ====================================================================
//  Get Wishlist Summary
// ====================================================================
async function getWishlistSummary(userId: string): Promise<WishlistSummary> {
  const supabase = await createServerClient();
  const [countResult, recentItemResult] = await Promise.all([
    supabase
      .from("wishlist_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("wishlist_items")
      .select("id, products!inner(slug, main_image_url, name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  return {
    totalItems: countResult.count ?? 0,
    recentItems:
      recentItemResult.data as unknown as WishlistSummary["recentItems"],
  };
}

// ====================================================================
//  Get Reviews Summary
// ====================================================================
async function getReviewsSummary(userId: string): Promise<ReviewsSummary> {
  const supabase = await createServerClient();
  const [totalReviewsResult, latestReviewResult] = await Promise.all([
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("reviews")
      .select(`rating,title,product:products!inner(name,slug)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  return {
    totalReviews: totalReviewsResult.count ?? 0,
    latestReview: latestReviewResult.data as ReviewsSummary["latestReview"],
  };
}

// ====================================================================
//  Get Addresses Summary
// ====================================================================
async function getAddressesSummary(userId: string): Promise<AddressesSummary> {
  const supabase = await createServerClient();
  const [totalAddressesResult, latestAddressResult] = await Promise.all([
    supabase
      .from("user_addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("user_addresses")
      .select(
        `address_nickname,first_name,last_name,address,city,state,zip,country`,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  return {
    totalAddresses: totalAddressesResult.count ?? 0,
    latestAddress: latestAddressResult.data,
  };
}
