"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/createServerClient";
import {
  type ServerActionResponse,
  type WishlistItemWithProduct,
} from "@/types";
import { unstable_noStore as noStore } from "next/cache";

// =================================================================
// 1. جلب عناصر قائمة الرغبات (Get Wishlist Items)
// =================================================================

export async function getWishlistItems(): Promise<WishlistItemWithProduct[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select(
      `
      id,
      created_at,
      product_id,
      user_id, 
      products (
        id,
        name,
        slug,
        main_image_url,
        product_variants (
          price,
          discount_price
        )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wishlist items:", error.message);
    return [];
  }

  const transformedItems = data
    .map((item) => {
      if (!item.products) return null;

      const productDetails = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      const defaultVariant = productDetails.product_variants?.[0];

      return {
        id: item.id,
        created_at: item.created_at,
        user_id: item.user_id,
        product_id: item.product_id,
        products: {
          id: productDetails.id,
          name: productDetails.name,
          slug: productDetails.slug,
          main_image_url: productDetails.main_image_url,
          price: defaultVariant?.price,
          discount_price: defaultVariant?.discount_price,
        },
      };
    })
    .filter(Boolean); // إزالة أي قيم null من المصفوفة

  // الآن يمكننا بأمان أن نقول أن المصفوفة من النوع المطلوب
  return transformedItems as WishlistItemWithProduct[];
}

// =================================================================
// 2. إضافة منتج إلى قائمة الرغبات (Add to Wishlist)
// =================================================================

export async function addToWishlist(
  productId: string,
): Promise<ServerActionResponse> {
  if (!productId) {
    return { success: false, error: "Product ID is required." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to add to wishlist.",
    };
  }

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ product_id: productId, user_id: user.id });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "This item is already in your wishlist.",
      };
    }
    console.error("Error adding to wishlist:", error.message);
    return { success: false, error: "Failed to add item to wishlist." };
  }

  revalidatePath("/wishlist");
  revalidatePath(`/products`);

  return { success: true, message: "Item added to wishlist!" };
}

// =================================================================
// 3. إزالة منتج من قائمة الرغبات (Remove from Wishlist)
// =================================================================

export async function removeFromWishlist(
  productId: string,
): Promise<ServerActionResponse> {
  if (!productId) {
    return { success: false, error: "Product ID is required." };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to remove from wishlist.",
    };
  }

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error removing from wishlist:", error.message);
    return { success: false, error: "Failed to remove item from wishlist." };
  }

  revalidatePath("/wishlist");
  revalidatePath(`/products`);

  return { success: true, message: "Item removed from wishlist." };
}

// =================================================================
// 4. التحقق مما إذا كان المنتج في قائمة الرغبات (Is Product in Wishlist)
// =================================================================

export async function checkWishlistStatus(
  productIds: string[],
): Promise<Record<string, boolean>> {
  if (!productIds || productIds.length === 0) {
    return {};
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return productIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .in("product_id", productIds)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error checking wishlist status:", error.message);
    return {};
  }

  const wishlistedIds = new Set(data.map((item) => item.product_id));
  const statusMap: Record<string, boolean> = {};
  for (const id of productIds) {
    statusMap[id] = wishlistedIds.has(id);
  }

  return statusMap;
}

/**
 * يجلب ملخص قائمة الرغبات للوحة القيادة.
 */

export async function getWishlistSummary() {
  noStore();
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { totalItems: 0, recentItems: [] };

  // جلب عدد العناصر
  const { count, error: countError } = await supabase
    .from("wishlist_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // جلب آخر 4 عناصر
  const { data: recentItemsData, error: recentItemsError } = await supabase
    .from("wishlist_items")
    .select("id, products (slug, main_image_url, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  if (countError || recentItemsError) {
    console.error(
      "Error fetching wishlist summary:",
      countError?.message || recentItemsError?.message,
    );
  }

  // ✅ --- التصحيح الحاسم: فلترة الـ null بشكل صحيح ---
  const recentItems =
    recentItemsData
      ?.map((item) => {
        if (Array.isArray(item.products) && item.products.length > 0) {
          // لا نستخدم `as` هنا بعد
          return item.products[0];
        }
        return null;
      })
      // 1. قم بالفلترة أولاً لإزالة جميع قيم null
      .filter(
        (
          product,
        ): product is {
          slug: string;
          main_image_url: string | null;
          name: string;
        } => product !== null,
      ) ?? []; // 2. الآن، TypeScript يعرف أن المصفوفة لا تحتوي على null

  return {
    totalItems: count ?? 0,
    recentItems: recentItems, // الآن النوع صحيح 100%
  };
}
