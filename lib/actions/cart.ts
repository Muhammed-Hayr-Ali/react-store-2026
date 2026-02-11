// lib/cart/actions.ts

"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { revalidatePath } from "next/cache";

// ====================================================================
// 1. تعريف نوع الحالة المرتجعة
// ====================================================================
export interface CartActionState {
  success: boolean;
  message: string;
}

// ====================================================================
// 2. دالة Server Action لإضافة عنصر إلى السلة (بدون Zod)
// ====================================================================
export async function addItemToCart(
  prevState: CartActionState | null,
  formData: FormData,
): Promise<CartActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      message: "You must be logged in to add items to your cart.",
    };
  }

  const variantId = formData.get("variantId") as string;
  const quantity = Number(formData.get("quantity"));

  if (
    !variantId ||
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      variantId,
    )
  ) {
    return { success: false, message: "Invalid product variant selected." };
  }
  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity < 1) {
    return { success: false, message: "Invalid quantity specified." };
  }

  try {
    const { data: cartId, error: cartError } = await supabase.rpc(
      "get_or_create_user_cart",
    );
    if (cartError || !cartId)
      throw new Error("Could not get or create a cart for the user.");

    const { error: upsertError } = await supabase.rpc("add_item_to_cart", {
      p_cart_id: cartId,
      p_variant_id: variantId,
      p_quantity: quantity,
    });
    if (upsertError) throw new Error("Could not add the item to the cart.");

    // revalidatePath("/products/[slug]", "layout");

    return { success: true, message: "Item added to cart successfully!" };
  } catch (error) {
    console.error("addItemToCart Server Action Error:", error);

    revalidatePath("/dashboard/cart");

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

// ====================================================================
// 3. دالة Server Action لجلب محتويات السلة (مع إزالة التعليقات)
// ====================================================================export async function getCart() {
export async function getCart() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: cart, error } = await supabase
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

  if (error) {
    console.error("Error fetching cart:", error);
    return null;
  }

  return cart;
}

// ====================================================================
// 4. ✅ دالة Server Action جديدة: حذف عنصر من السلة
// ====================================================================
export async function removeItem(itemId: string) {
  const supabase = await createServerClient();

  // التحقق من وجود مستخدم
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data: cartItem, error: validationError } = await supabase
    .from("cart_items")
    .select("id, cart:carts!inner(user_id)")
    .eq("id", itemId)
    .eq("carts.user_id", user.id)
    .single();

  if (validationError || !cartItem) {
    throw new Error(
      "Cart item not found or you do not have permission to remove it.",
    );
  }

  // تنفيذ الحذف
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

  if (error) {
    console.error("Remove item error:", error);
    throw new Error("Could not remove item from cart.");
  }

  // إعادة التحقق من المسارات لتحديث الواجهة
  revalidatePath("/cart");
}

// ====================================================================
// 5. ✅ دالة Server Action جديدة: تحديث كمية عنصر
// ====================================================================
export async function updateItemQuantity(itemId: string, quantity: number) {
  const supabase = await createServerClient();

  // التحقق من صحة الكمية
  if (quantity < 1 || !Number.isInteger(quantity)) {
    throw new Error("Invalid quantity.");
  }

  // التحقق من وجود مستخدم
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Authentication required.");
  }

  // التحقق من أن العنصر المطلوب تحديثه ينتمي بالفعل إلى سلة المستخدم
  const { data: cartItem, error: validationError } = await supabase
    .from("cart_items")
    .select("id, cart:carts!inner(user_id)")
    .eq("id", itemId)
    .eq("carts.user_id", user.id)
    .single();

  if (validationError || !cartItem) {
    throw new Error(
      "Cart item not found or you do not have permission to update it.",
    );
  }

  // تنفيذ التحديث
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: quantity })
    .eq("id", itemId);

  if (error) {
    console.error("Update quantity error:", error);
    throw new Error("Could not update item quantity.");
  }

  // إعادة التحقق من المسارات لتحديث الواجهة
  revalidatePath("/cart");
}
