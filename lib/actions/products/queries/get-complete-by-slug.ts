/**
 * @file lib/actions/products/queries/get-complete-by-slug.ts
 * @description Retrieves a full product with all related variants and images by its URL slug.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import type { ProductWithRelations } from "../types"

// ============================================================================
// Parameter Interfaces
// ============================================================================

interface GetProductOptions {
  activeOnly?: boolean
}

// ============================================================================
// Main Query Function
// ============================================================================

export async function getProductCompleteBySlug(
  slug: string,
  options: GetProductOptions = {}
): Promise<ApiResult<ProductWithRelations>> {
  const { activeOnly = true } = options

  if (!slug || typeof slug !== "string") {
    return {
      success: false,
      error: "INVALID_SLUG",
      details: { database: ["Product slug is required."] },
    }
  }

  const supabase = await createServerClient()

  let query = supabase
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
    .eq("slug", slug)

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query.single()

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

  return { success: true, data: data as unknown as ProductWithRelations }
}
