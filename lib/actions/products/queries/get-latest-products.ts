/**
 * @file lib/actions/products/queries/get-latest-products.ts
 * @description Retrieves latest non-featured products sorted chronologically for homepage feeds.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { getLatestProductsSchema } from "../schemas"
import {
  GetLatestProductsOptions,
  LatestProductItem,
  RawLatestProductQueryResult,
} from "../types"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getLatestProducts(
  options: Partial<GetLatestProductsOptions> = {}
): Promise<ApiResult<LatestProductItem[]>> {
  // 1. Validate query options
  const validation = getLatestProductsSchema.safeParse(options)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "INVALID_PARAMETERS",
      details: fieldErrors,
    }
  }

  const { limit, activeOnly } = validation.data

  try {
    const supabase = await createServerClient()

    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        created_at,
        brand:brands!products_brand_id_fkey (name, slug),
        category:categories!products_category_id_fkey (name, slug),
        product_variants (price, is_active),
        product_images (url, is_primary)
      `
      )
      .eq("is_featured", false)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: "FETCH_LATEST_PRODUCTS_ERROR",
        details: { database: [error.message] },
      }
    }

    const rawProducts = (data || []) as unknown as RawLatestProductQueryResult[]

    const formattedProducts: LatestProductItem[] = rawProducts.map((prod) => {
      const activeVariants = (prod.product_variants || []).filter(
        (v) => v.is_active
      )
      const prices = activeVariants.map((v) => Number(v.price))
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0

      const images = prod.product_images || []
      const primaryImg =
        images.find((img) => img.is_primary)?.url || images[0]?.url || null

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        created_at: prod.created_at,
        min_price: minPrice,
        primary_image_url: primaryImg,
        brand_name: prod.brand?.name || null,
        brand_slug: prod.brand?.slug || null,
        category_name: prod.category?.name || null,
        category_slug: prod.category?.slug || null,
      }
    })

    return {
      success: true,
      data: formattedProducts,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error occurred"

    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
