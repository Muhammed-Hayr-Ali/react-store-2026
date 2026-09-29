"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import type { ProductWithRelations } from "../types" // تأكد من مسار الأنواع الصحيح

export async function getProductCompleteBySlug(
  slug: string
): Promise<ApiResult<ProductWithRelations>> {
  if (!slug || typeof slug !== "string") {
    return {
      success: false,
      error: "INVALID_SLUG_PROVIDED",
      details: { database: ["معرف المنتج (Slug) مطلوب"] },
    }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories!products_category_id_fkey (id, name, slug, name_ar),
      brand:brands!products_brand_id_fkey (id, name, slug, name_ar, logo_url),
      product_variants (
        id, sku, name, price, is_active, attributes, sort_order, 
        stock_quantity, track_inventory, compare_at_price, low_stock_threshold
      ),
      product_images (
        id, url, alt_text, is_primary, sort_order, variant_id
      )
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "PRODUCT_NOT_FOUND" }
    }
    return {
      success: false,
      error: "FETCH_PRODUCT_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data as ProductWithRelations }
}
