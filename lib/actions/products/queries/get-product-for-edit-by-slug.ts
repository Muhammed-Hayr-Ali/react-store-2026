/**
 * @file lib/actions/products/queries/get-product-for-edit-by-slug.ts
 * @description Retrieves the product details required by the edit form using its slug.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "../../types/utils"
import type { ProductWithRelations } from "../types"

interface GetProductOptions {
  activeOnly?: boolean
}

export async function getProductForEditBySlug(
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
        image_url
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
        expiration_date,
        is_active,
        sort_order,
        attributes
      ),
      product_images (
        id,
        url,
        alt_text,
        is_primary,
        variant_sku
      )
    `
    )
    .eq("slug", slug)

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data: productData, error } = await query.maybeSingle()

  if (error) {
    console.error("[getProductForEditBySlug] Database query failed", {
      slug,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    return {
      success: false,
      error: "FETCH_PRODUCT_ERROR",
      details: {
        database: [
          [error.code, error.message, error.details, error.hint]
            .filter(Boolean)
            .join(" | "),
        ],
      },
    }
  }

  if (!productData) {
    return {
      success: false,
      error: "PRODUCT_NOT_FOUND",
      details: { database: [`No product found for slug: ${slug}`] },
    }
  }

  const product = productData as unknown as ProductWithRelations

  return { success: true, data: product }
}
