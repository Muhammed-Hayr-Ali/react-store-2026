/**
 * @file lib/actions/products/queries/get-by-id.ts
 * @description Retrieves a single product with nested category and brand hierarchy by UUID.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ProductWithRelations } from "../types"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getProductById(
  id: string
): Promise<ApiResult<ProductWithRelations | null>> {
  // 1. Validate UUID parameter
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  const supabase = await createServerClient()

  // 2. Execute query with relational joins
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
        parent_id,
        parent:categories!categories_parent_id_fkey (
          id,
          name,
          name_ar,
          slug
        )
      ),
      brand:brands!products_brand_id_fkey (
        id,
        name,
        name_ar,
        slug,
        logo_url
      )
    `
    )
    .eq("id", idValidation.data)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null }
    }
    return {
      success: false,
      error: "FETCH_PRODUCT_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data as unknown as ProductWithRelations }
}
