/**
 * @file lib/actions/products/queries/get-products-by-category.ts
 * @description Retrieves products associated with a specific category ID or slug, prioritizing featured items.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { getProductsByCategorySchema } from "../schemas"
import {
  GetProductsByCategoryOptions,
  CategoryProductItem,
  RawCategoryProductQueryResult,
} from "../types"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getProductsByCategory(
  options: GetProductsByCategoryOptions
): Promise<ApiResult<CategoryProductItem[]>> {
  // 1. Validate options
  const validation = getProductsByCategorySchema.safeParse(options)
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

  const { categorySlug, categoryId, limit, activeOnly } = validation.data

  try {
    const supabase = await createServerClient()

    let resolvedCategoryId = categoryId

    if (!resolvedCategoryId && categorySlug) {
      const { data: categoryData, error: catError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle()

      if (catError || !categoryData) {
        return {
          success: false,
          error: "CATEGORY_NOT_FOUND",
          details: { database: [catError?.message || "Category not found"] },
        }
      }

      resolvedCategoryId = categoryData.id
    }

    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        is_featured,
        created_at,
        brand:brands!products_brand_id_fkey (name, slug),
        category:categories!products_category_id_fkey (name, slug),
        product_variants (price, is_active),
        product_images (url, is_primary)
      `
      )
      .eq("category_id", resolvedCategoryId!)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: "FETCH_CATEGORY_PRODUCTS_ERROR",
        details: { database: [error.message] },
      }
    }

    const rawProducts = (data ||
      []) as unknown as RawCategoryProductQueryResult[]

    const formattedProducts: CategoryProductItem[] = rawProducts.map((prod) => {
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
        is_featured: prod.is_featured,
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
