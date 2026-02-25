"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { revalidatePath } from "next/cache";
import { getUser } from "./get-user-action";

// ===============================================================================
// File Name: cart.ts
// Description: User Cart Management Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-21
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

// ====================================================================
// Api Response Type
// ====================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// ====================================================================
// Cart Types
// ====================================================================
export type UserCart = {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  cart_items: CartItem[];
};

// ====================================================================
// Cart Item Types
// ====================================================================
export type CartItem = {
  id: string;
  cart_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  variant_id: string;
  product_variants: ProductVariants;
};

// ====================================================================
// Product Variant Types
// ====================================================================
export type ProductVariants = {
  id: string;
  sku: string;
  price: number;
  products: Products;
  image_url: string;
  created_at: Date;
  is_default: boolean;
  product_id: string;
  discount_price: number | null;
  stock_quantity: number;
  discount_expires_at: null;
  variant_option_values: VariantOptionValue[];
};

// ====================================================================
// Product Types
// ====================================================================
export type Products = {
  id: string;
  name: string;
  slug: string;
  tags: string[];
  brand_id: string;
  created_at: Date;
  image_urls: string[];
  updated_at: Date;
  category_id: string;
  description: string;
  is_featured: boolean;
  is_available: boolean;
  main_image_url: string;
  short_description: string;
};

// ====================================================================
// Variant Option Value Types
// ====================================================================
export type VariantOptionValue = {
  variant_id: string;
  option_value_id: string;
  product_option_values: ProductOptionValues;
};

// ====================================================================
// Product Option Value Types
// ====================================================================
export type ProductOptionValues = {
  id: string;
  value: string;
  option_id: string;
};

// ====================================================================
// Get Cart Query
// ====================================================================
const GET_CART_QUERY = `
      *,
      cart_items (
        *,
        product_variants (
          *,
          products (
            *
          ),
          variant_option_values (
          *,
            product_option_values (
              *
            )
          )
        )
      )
    `;

// ====================================================================
// Get Cart & Cart Items
// ====================================================================
export async function getCart(): Promise<ApiResponse<UserCart>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    // console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }
  // Fetch cart for the authenticated user using a single query that retrieves the cart and its related items and product details
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select(GET_CART_QUERY)
    .eq("user_id", user.id)
    .maybeSingle();

  // Error handling for cart fetching: If there's an error fetching the cart, we log it and return a user-friendly error message
  if (cartError) {
    console.error("Error fetching cart:", cartError);
    return { error: "Failed to fetch cart." };
  }

  // Sort cart items by created_at timestamp to ensure they are displayed in the order they were added to the cart
  if (cart && cart.cart_items) {
    cart.cart_items.sort(
      (a: CartItem, b: CartItem) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  return { data: cart };
}

// ====================================================================
// Get Items Count
// ====================================================================
export async function getTotalCartQuantity(): Promise<ApiResponse<number>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    // console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }
  // Call the RPC function to get the total quantity of items in the user's cart. This function should return a single value representing the total quantity.
  const { data, error } = await supabase.rpc("get_my_total_cart_quantity");

  if (error) {
    console.error("Error calling RPC:", error.message);
    return { error: error.message };
  }
  // The result of the RPC call is directly the count.
  return { data };
}

// ====================================================================
// Add Item To Cart
// ====================================================================
export async function addItemToCart({
  variantId,
  quantity,
}: {
  variantId: string;
  quantity: number;
}): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }

  // Critical validation: Ensure that the variant ID is provided and is in a valid UUID format,
  if (
    !variantId ||
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      variantId,
    )
  ) {
    console.error("Invalid variant ID specified:", variantId);
    return { data: false, error: "Invalid product variant specified." };
  }

  // Critical validation: Ensure that the quantity is provided and is a positive integer
  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity < 1) {
    console.error("Invalid quantity specified:", quantity);
    return { data: false, error: "Invalid quantity specified." };
  }

  // Get or create the user's cart.
  try {
    const { data: cartId, error: cartError } = await supabase.rpc(
      "get_or_create_user_cart",
    );

    // Critical error handling: If there's an error fetching or creating the cart, we log it and return a user-friendly error message. This is critical because without a cart, we cannot add items.
    if (cartError || !cartId) {
      console.error("Error getting or creating the cart:", cartError);
      return { data: false, error: "Could not access the cart." };
    }

    // Call the RPC function to add the item to the cart. This function should handle both inserting a new item or updating the quantity if the item already exists in the cart.
    const { error: upsertError } = await supabase.rpc("add_item_to_cart", {
      p_cart_id: cartId,
      p_variant_id: variantId,
      p_quantity: quantity,
    });

    // Critical error handling: If there's an error adding the item to the cart, we log it and return a user-friendly error message. This is critical because it directly affects the user's ability to add items to their cart, which is a core functionality of the application.
    if (upsertError) {
      console.error("Error adding item to the cart:", upsertError);
      return { data: false, error: "Could not add the item to the cart." };
    }

    // Revalidate the cart page to ensure that the UI reflects the updated cart state after adding an item. This is important for providing immediate feedback to the user that their action was successful.
    revalidatePath("/cart");

    // Return a success response indicating that the item was successfully added to the cart
    return { data: true };
  } catch (error) {
    console.error("An unexpected error occurred in addItemToCart:", error);
    return { data: false, error: "An unexpected error occurred." };
  }
}

// ====================================================================
// Remove Item
// ====================================================================
export async function removeItem(
  itemId: string,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }

  // Check if the item belongs to the authenticated user
  const { data: checkedItem, error: errorCheck } = await supabase
    .from("cart_items")
    .select("id, cart:carts!inner(user_id)")
    .eq("id", itemId)
    .eq("carts.user_id", user.id)
    .single();

  // Critical error handling: If there's an error checking the item, we log it and return a user-friendly error message
  if (errorCheck || !checkedItem) {
    console.error("Error checking item:", errorCheck);
    return { error: errorCheck?.message };
  }

  // Delete the item
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

  // Critical error handling: If there's an error deleting the item, we log it and return a user-friendly error message
  if (error) {
    console.error("Error deleting item:", error.message);
    return { error: error.message };
  }

  // Revalidate the cart page to ensure that the UI reflects the updated cart state after removing an item
  revalidatePath("/cart");
  return { data: true };
}

// ====================================================================
// Update Item Quantity
// ====================================================================
export async function updateItemQuantity(
  itemId: string,
  quantity: number,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }

  // Critical validation: Ensure that the quantity is a positive integer. This is important to prevent invalid data from being saved to the database, which could lead to issues with order processing and inventory management.
  if (quantity < 1 || !Number.isInteger(quantity)) {
    console.error("Invalid quantity.");
    return { error: "Invalid quantity." };
  }

  // Check if the user has permission to update the cart item
  const { data: cartItem, error: validationError } = await supabase
    .from("cart_items")
    .select("id, cart:carts!inner(user_id)")
    .eq("id", itemId)
    .eq("carts.user_id", user.id)
    .single();

  // Critical error handling: If there's an error validating the cart item, we log it and return a user-friendly error message
  if (validationError || !cartItem) {
    console.error("Error validating cart item:", validationError);
    return { error: validationError?.message };
  }

  // Update quantity
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: quantity })
    .eq("id", itemId);

  // Critical error handling: If there's an error updating the cart item quantity, we log it and return a user-friendly error message
  if (error) {
    console.error("Error updating cart item quantity:", error.message);
    return { error: error.message };
  }

  // Revalidate the cart page to ensure that the UI reflects the updated cart state
  revalidatePath("/cart");
  // Return a success response indicating that the item quantity was successfully updated
  return { data: true };
}
