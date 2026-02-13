"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { revalidatePath } from "next/cache";
import { getUser } from "./get-user-action";

// ===============================================================================
// File Name: cart.ts
// Description: User Cart Management Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

// ===============================================================================
// // Api Response Type
// ===============================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  [key: string]: unknown;
};

// ===============================================================================
// Cart Types
// ===============================================================================
export type Cart = {
  id: string;
  user_id: string;
  cart_items: CartItem[];
  [key: string]: unknown;
};

// ===============================================================================
// Cart Item Types
// ===============================================================================
export type CartItem = {
  id: string;
  cart_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  variant_id: string;
  product_variants: ProductVariant;
};

// ===============================================================================
// Product Variant Types
// ===============================================================================
export type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  products: Product;
  image_url: string | null;
  created_at: string;
  is_default: boolean;
  product_id: string;
  discount_price: number | null;
  stock_quantity: number;
  discount_expires_at: string | null;
  variant_option_values: VariantOptionValues[];
};

export type VariantOptionValues = {
  variant_id: string;
  option_value_id: string;
  product_option_values: {
    id: string;
    value: string;
    option_id: string;
  };
};

// ===============================================================================
// Product Types
// ===============================================================================
export type Product = {
  id: string;
  name: string;
  slug: string;
  tags: string | null;
  brand_id: string;
  created_at: string;
  image_urls: string | null;
  updated_at: string;
  category_id: string;
  description: string;
  is_featured: boolean;
  is_available: boolean;
  main_image_url: string;
  short_description: string;
};

// ====================================================================
// Get Items Count
// ====================================================================
export async function getTotalCartQuantity(): Promise<
  ApiResponse<number | null>
> {
  const supabase = await createServerClient();

  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { data: undefined, error: userError };
  }

  // --- ✅ The RPC Way ---
  const { data, error } = await supabase.rpc("get_my_total_cart_quantity");

  if (error) {
    console.error("Error calling RPC:", error.message);
    return { data: null, error: error.message };
  }

  // The result of the RPC call is directly the count.
  return { data };
}

// ====================================================================
// Get Cart & Cart Items
// ====================================================================
export async function getCart(): Promise<ApiResponse<Cart>> {
  const supabase = await createServerClient();

  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { data: undefined, error: userError };
  }

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select(
      `
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
    `,
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (cartError || !cart) {
    // console.error("Error fetching cart:", cartError);
    return { error: cartError?.message };
  }

  if (cart && cart.cart_items) {
    cart.cart_items.sort(
      (a: CartItem, b: CartItem) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  return { data: cart };
}
// ====================================================================
// Add Item To Cart
// ====================================================================
export async function addItemToCart(
  prevState: ApiResponse<boolean> | null,
  formData: FormData,
): Promise<ApiResponse<boolean>> {
  const supabase = await createServerClient();

  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: userError };
  }

  const variantId = formData.get("variantId") as string;
  const quantity = Number(formData.get("quantity"));

  if (
    !variantId ||
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      variantId,
    )
  ) {
    console.error("Invalid variant ID specified.");
    return { data: false, error: "Invalid variant ID specified." };
  }
  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity < 1) {
    console.error("Invalid quantity specified.");
    return { data: false, error: "Invalid quantity specified." };
  }

  // !! Database Functions (For Getting or Creating a Cart for the User)
  try {
    const { data: cartId, error: cartError } = await supabase.rpc(
      "get_or_create_user_cart",
    );

    if (cartError || !cartId) {
      console.error("Error getting or creating the cart:", cartError);
      return { data: false, error: "Could not get or create the cart." };
    }

    // !! Database Functions (For Adding an Item to the Cart)
    const { error: upsertError } = await supabase.rpc("add_item_to_cart", {
      p_cart_id: cartId,
      p_variant_id: variantId,
      p_quantity: quantity,
    });

    if (upsertError) {
      console.error("Error adding item to the cart:", upsertError);
      return { data: false, error: "Could not add item to the cart." };
    }

    // revalidatePath("/products/[slug]", "layout");

    revalidatePath("/cart");

    return { data: true };
  } catch (error) {
    console.error("Error adding item to the cart:", error);
    return { data: false, error: "Could not add item to the cart." };
  }
}

// ====================================================================
// Remove Item
// ====================================================================
export async function removeItem(
  itemId: string,
): Promise<ApiResponse<boolean>> {
  const supabase = await createServerClient();

  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: userError };
  }

  const { data: checkedItem, error: errorCheck } = await supabase
    .from("cart_items")
    .select("id, cart:carts!inner(user_id)")
    .eq("id", itemId)
    .eq("carts.user_id", user.id)
    .single();

  if (errorCheck || !checkedItem) {
    console.error("Error checking item:", errorCheck);
    return { error: errorCheck?.message };
  }

  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

  if (error) {
    console.error("Error deleting item:", error.message);
    return { error: error.message };
  }
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
  const supabase = await createServerClient();

  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: userError };
  }

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

  if (validationError || !cartItem) {
    console.error("Error validating cart item:", validationError);
    return { error: validationError?.message };
  }

  // Update quantity
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: quantity })
    .eq("id", itemId);

  if (error) {
    console.error("Error updating cart item quantity:", error.message);
    return { error: error.message };
  }

  revalidatePath("/cart");

  return { data: true };
}
