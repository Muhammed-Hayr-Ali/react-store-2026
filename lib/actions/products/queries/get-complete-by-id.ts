"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import type { ProductWithRelations } from "../types"

/**
 * جلب منتج واحد مع تصنيفه، علامته التجارية، متغيراته، وصوره المرتبطة به
 */
export async function getProductCompleteById(
  id: string
): Promise<ApiResult<ProductWithRelations | null>> {
  if (!id || typeof id !== "string" || id === "undefined" || id === "null") {
    return {
      success: false,
      error: "INVALID_ID_PROVIDED",
      details: {
        database: ["معرف المنتج (ID) مطلوب ويجب أن يكون بصيغة UUID صحيحة"],
      },
    }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories!products_category_id_fkey (
        id,
        name,
        name_ar,
        slug,
        parent_id
      ),
      brand:brands!products_brand_id_fkey (
        id,
        name,
        name_ar,
        slug,
        logo_url
      ),
      product_variants (
        id,
        sku,
        name,
        price,
        compare_at_price,
        stock_quantity,
        track_inventory,
        low_stock_threshold,
        is_active,
        sort_order,
        attributes
      ),
      product_images (
        id,
        url,
        alt_text,
        is_primary,
        sort_order,
        variant_id
      )
    `
    )
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "PRODUCT_NOT_FOUND" }
    }
    return {
      success: false,
      error: "FETCH_PRODUCT_COMPLETE_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data as unknown as ProductWithRelations }
}
