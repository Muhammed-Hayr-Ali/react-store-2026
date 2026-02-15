"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/createServerClient";
import { type ServerActionResponse } from "@/types";
import { unstable_noStore as noStore } from "next/cache";
import { getUser } from "./get-user-action";

// 1. تعريف النوع لمتغير المنتج الواحد (Product Variant)
// يمثل كل تركيبة ممكنة من المنتج (مثل لون وحجم معين)
export type Variants = {
  id: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  discount_expires_at: string | null;
};

// 2. تعريف النوع للمنتج الأساسي (Product)
// يحتوي على المعلومات العامة للمنتج ومصفوفة من متغيراته

// 3. تعريف النوع لعنصر قائمة المفضلة (WishlistItem)
// يربط بين المستخدم والمنتج، ويحتوي على كائن المنتج المتداخل
export type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  variants: Variants[];
};

export type WishlistItem = {
  id: string;
  created_at: string;
  product_id: string;
  user_id: string;
  product: WishlistProduct;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// =================================================================
// 1. جلب عناصر قائمة الرغبات (Get Wishlist Items)
// =================================================================

export async function getWishlistItems(): Promise<
  ApiResponse<WishlistItem[]|[]>
> {
  const supabase = await createServerClient();
  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Failed to fetch wishlist items." };
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select(
      `
      id,
      created_at,
      product_id,
      user_id, 
      product:products (
        id,
        name,
        slug,
        main_image_url,
        variants:product_variants (
        id,
          price,
          discount_price,
          discount_expires_at,
          stock_quantity
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching wishlist items:", error.message);
    return { error: "Failed to fetch wishlist items." };
  }

  // الآن يمكننا بأمان أن نقول أن المصفوفة من النوع المطلوب
  return { data: data as unknown as WishlistItem[] };
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
