//================================================================
// 1. Search Products By Query
//================================================================

import { createBrowserClient } from "../supabase/createBrowserClient";

// --- ✅ 1. تعريف أنواع موحدة وصحيحة ---
export interface Variant {
  product_id: string;
  price: number;
  discount_price: number | null;
  discount_expires_at: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  variants: Variant[];
}

// --- دالة جلب البيانات المصححة ---
export async function getProductsByQuery(query: string): Promise<Product[]> {
  if (!query.trim()) {
    return [];
  }

  const supabase = createBrowserClient(); // ✅ لا حاجة لـ await هنا
  const searchQuery = `%${query}%`;

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, slug, main_image_url, variants:product_variants(product_id, price, discount_price, discount_expires_at)`,
    )
    .ilike("name", searchQuery)
    .order("name", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Supabase search error:", error.message);
    return [];
  }

  // ✅ 2. لا حاجة لتحويل النوع، Supabase يوفر النوع الصحيح إذا تم تكوينه بشكل جيد
  return data || [];
}
