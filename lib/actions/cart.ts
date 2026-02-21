"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { revalidatePath } from "next/cache";
import { getUser } from "./get-user-action";
import { User } from "@supabase/supabase-js";


export type ApiResponse<T> = {
  data?: T;
  error?: string;
};



export type UserCart = {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  cart_items: CartItem[];
}

export type CartItem = {
  id: string;
  cart_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
  variant_id: string;
  product_variants: ProductVariants;
}

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
}

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
}

export type VariantOptionValue = {
  variant_id: string;
  option_value_id: string;
  product_option_values: ProductOptionValues;
}

export type ProductOptionValues = {
  id: string;
  value: string;
  option_id: string;
}




// ===============================================================================
// File Name: cart.ts
// Description: User Cart Management Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================


// ====================================================================
// Get Items Count
// ====================================================================
export async function getTotalCartQuantity(): Promise<
  ApiResponse<number | null>
> {
  const supabase = await createServerClient();

  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    // console.error("Error fetching user:", userError);
    return { error: userError };
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
export async function getCart(): Promise<ApiResponse<UserCart | null>> {
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



export async function addItemToCart({
  variantId,
  quantity,
}: {
  variantId: string;
  quantity: number;
}): Promise<ApiResponse<boolean>> {
  const supabase = await createServerClient();

  // 1. التحقق من وجود جلسة مستخدم
  const { data: user, error: userError } = await getUser();
  if (userError || !user) {
    console.error("addItemToCart Error: Auth session missing!", userError);
    // إرجاع خطأ واضح يمكن للواجهة الأمامية التعامل معه
    return { error: "Auth session missing!" };
  }

  // 2. استخراج والتحقق من صحة البيانات من FormData

  if (
    !variantId ||
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      variantId,
    )
  ) {
    console.error("Invalid variant ID specified:", variantId);
    return { data: false, error: "Invalid product variant specified." };
  }

  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity < 1) {
    console.error("Invalid quantity specified:", quantity);
    return { data: false, error: "Invalid quantity specified." };
  }

  // 3. تنفيذ العمليات على قاعدة البيانات
  try {
    // استدعاء دالة RPC للحصول على سلة المستخدم أو إنشائها
    const { data: cartId, error: cartError } = await supabase.rpc(
      "get_or_create_user_cart",
    );

    if (cartError || !cartId) {
      console.error("Error getting or creating the cart:", cartError);
      return { data: false, error: "Could not access the cart." };
    }

    // استدعاء دالة RPC لإضافة المنتج إلى السلة
    const { error: upsertError } = await supabase.rpc("add_item_to_cart", {
      p_cart_id: cartId,
      p_variant_id: variantId,
      p_quantity: quantity,
    });

    if (upsertError) {
      console.error("Error adding item to the cart:", upsertError);
      // يمكنك هنا إضافة منطق لمعالجة أخطاء معينة، مثل "المنتج غير متوفر"
      return { data: false, error: "Could not add the item to the cart." };
    }

    // 4. إعادة التحقق من صحة المسارات (Revalidation)
    // هذا يخبر Next.js بتحديث البيانات في الصفحات المتأثرة
    revalidatePath("/cart");

    // 5. إرجاع نتيجة النجاح
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
