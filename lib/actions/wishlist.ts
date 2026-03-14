"use server";

import { getUser } from "./get-user-action";
import { createServerClient } from "../supabase/createServerClient";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { calculateDiscountPercentage } from "./convert-functions";

// ===============================================================================
// File Name: wishlist.ts
// Description: Wishlist Management Actions.
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-03-14
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Api Response Type
// ================================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  [key: string]: unknown;
};

// ================================================================
// ProductRaw type
// ================================================================
type ProductRaw = {
  id: string;
  name: string;
  slug: string;
  is_featured: boolean;
  short_description: string | null;
  main_image_url: string | null;
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  };
  variants: {
    id: string;
    price: number;
    discount_price: number | null;
    is_default: boolean;
    stock_quantity?: number;
    image_url?: string;
  }[];
  average_rating: number;
  reviews_count: number;
  created_at: string;
};

// ===============================================================
// MiniProduct type
// ===============================================================
export type MiniProduct = {
  name: string;
  slug: string;
  short_description: string | null;
  main_image_url: string | null;
  category: string;
  brand: string;
  is_featured: boolean;
  // ✅ بيانات محسوبة من المتغير الافتراضي
  price: number;
  discount_price: number | null;
  discountPercentage: number | null;
  stock_quantity: number;
  variant_id: string;
  average_rating: number;
  total_reviews: number;
};

// =================================================================
// Wishlist Queries
// =================================================================
const PRODUCTS_QUERY = `*, 
      product:products(
      *,
        category:categories (id, name),
        brand:brands (id, name),
        variants:product_variants (
          id,
          price,
          discount_price,
          is_default,
          stock_quantity,
          image_url
          )
        )`;

// =================================================================
// Check if UUID is valid Helper functions
// =================================================================
const isValidUUID = (uuid: string): boolean => {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

// =================================================================
// Get wishlist items for the authenticated user
// =================================================================
export async function getWishlist(): Promise<ApiResponse<MiniProduct[]>> {
  noStore(); // Ensure this action is not cached and always runs on the server for real-time data

  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    // console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }
  // Fetch wishlist items for the authenticated user, including related product data
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(PRODUCTS_QUERY)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching wishlist items:", error);
    return { error: "Failed to fetch wishlist items." };
  }

  // Convert wishlist items to MiniProduct format
  const wishlistItems: MiniProduct[] = data.map((item) => {
    const product = item.product as ProductRaw;
    const defaultVariant = product.variants.find((v) => v.is_default === true);
    const discountPrice = defaultVariant?.discount_price ?? null;

    return {
      name: product.name,
      slug: product.slug,
      short_description: product.short_description,
      main_image_url: product.main_image_url,
      category: product.category.name,
      brand: product.brand.name,
      is_featured: product.is_featured,
      price: defaultVariant?.price || 0,
      discount_price: discountPrice,
      discountPercentage: calculateDiscountPercentage(
        defaultVariant?.discount_price,
        defaultVariant?.price,
      ),
      stock_quantity: defaultVariant?.stock_quantity || 0,
      variant_id: defaultVariant?.id || "",
      average_rating: product.average_rating,
      total_reviews: product.reviews_count,
    };
  });

  return {
    data: wishlistItems,
  };
}

// =================================================================
// Add to Wishlist
// =================================================================
export async function addToWishlist(
  productId: string,
): Promise<ApiResponse<boolean>> {
  // Check if productId is provided
  if (!productId) {
    console.error("Product ID is required.");
    return { error: "Product ID is required." };
  }
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }

  // Add the product to the wishlist
  const { error } = await supabase
    .from("wishlist_items")
    .insert({ product_id: productId, user_id: user.id });

  // Critical error handling: Handle duplicate entries gracefully and log other errors
  if (error) {
    if (error.code === "23505") {
      console.warn("Attempted to add duplicate item to wishlist:", productId);
      return {
        error: "This item is already in your wishlist.",
      };
    }
    console.error("Error adding to wishlist:", error.message);
    return { error: "Failed to add item to wishlist." };
  }

  // Revalidate the wishlist page
  revalidatePath("/wishlist");
  return { data: true };
}

// =================================================================
//Remove from Wishlist
// =================================================================
export async function removeFromWishlist(
  productId: string,
): Promise<ApiResponse<boolean>> {
  // Check if productId is provided
  if (!productId) {
    console.error("Product ID is required.");
    return { error: "Product ID is required." };
  }
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }

  // Remove the product from the wishlist
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", user.id);

  // Critical error handling: Handle duplicate entries gracefully and log other errors
  if (error) {
    console.error("Error removing from wishlist:", error.message);
    return { error: "Failed to remove item from wishlist." };
  }

  // Revalidate the wishlist page
  revalidatePath("/wishlist");
  // No need to return data here, but we can return a success flag if desired
  return { data: true };
}

// =================================================================
// Check if Products is Wishlisted
// =================================================================
export async function checkWishlistStatus(
  productIds: string[],
): Promise<ApiResponse<Record<string, boolean>>> {
  // Check if productIds is provided
  if (!productIds || productIds.length === 0) {
    return { error: "Product IDs are required." };
  }

  // Filter out invalid UUIDs before querying the database
  const validIds = productIds.filter((id) => isValidUUID(id));
  const invalidIds = productIds.filter((id) => !isValidUUID(id));

  // Log a warning if any invalid UUIDs are found
  if (invalidIds.length > 0) {
    console.warn(
      `⚠️ Warning: Ignored ${invalidIds.length} invalid UUID(s) in wishlist check:`,
      invalidIds,
    );
  }

  // Critical handling: If all provided IDs are invalid, we can return false for all of them without querying the database
  if (validIds.length === 0) {
    const emptyStatusMap: Record<string, boolean> = {};
    productIds.forEach((id) => (emptyStatusMap[id] = false));
    return { data: emptyStatusMap };
  }

  const supabase = await createServerClient();
  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    // console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }

  //  We only query the database for valid UUIDs, ensuring we don't run into errors due to invalid input. The invalid IDs will be handled in the final mapping step.
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", validIds);

  if (error) {
    console.error("Database Error:", error.message);
    return { error: "Failed to check wishlist status." };
  }

  // Mapping the results to a boolean status for each product ID, including handling for invalid IDs
  const wishlistedSet = new Set(data?.map((item) => item.product_id) || []);
  const statusMap: Record<string, boolean> = {};

  // Critical handling: We iterate over the original list of product IDs to ensure we return a status for each one, including those that were invalid. Invalid IDs are automatically marked as not wishlisted (false), while valid IDs are checked against the database results.
  for (const id of productIds) {
    if (invalidIds.includes(id)) {
      // Set status to false for invalid UUIDs without querying the database
      statusMap[id] = false;
    } else {
      // Check if the product ID is in the wishlisted set
      statusMap[id] = wishlistedSet.has(id);
    }
  }
  // This approach ensures that we handle all input gracefully, providing a complete status map for the original list of product IDs while avoiding any database errors caused by invalid UUIDs.
  return { data: statusMap };
}

// =================================================================
