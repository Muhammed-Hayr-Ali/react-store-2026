/**
 * @file lib/actions/products/queries/get-featured-slides.ts
 * @description Retrieves a curated list of featured products specifically formatted for storefront carousels.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { FeaturedProductSlide } from "../types"

// ============================================================================
// Parameter & Internal Query Interfaces
// ============================================================================

interface GetFeaturedSlidesOptions {
  limit?: number
}

interface RawProductVariant {
  price: number
  is_active: boolean
}

interface RawProductImage {
  url: string
  is_primary: boolean
}

interface RawBrand {
  name: string
}

interface RawFeaturedProduct {
  id: string
  name: string
  slug: string
  description: string | null
  brand: RawBrand | null
  product_variants: RawProductVariant[] | null
  product_images: RawProductImage[] | null
}

// ============================================================================
// Main Query Function
// ============================================================================

export async function getFeaturedProductSlides(
  options: GetFeaturedSlidesOptions = {}
): Promise<ApiResult<FeaturedProductSlide[]>> {
  const { limit = 5 } = options

  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        brand:brands!products_brand_id_fkey (name),
        product_variants (price, is_active),
        product_images (url, is_primary)
      `
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(limit)

    if (error) {
      return {
        success: false,
        error: "FETCH_FEATURED_PRODUCTS_ERROR",
        details: { database: [error.message] },
      }
    }

    const rawProducts = (data || []) as unknown as RawFeaturedProduct[]

    const slides: FeaturedProductSlide[] = rawProducts.map((prod) => {
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
        min_price: minPrice,
        primary_image_url: primaryImg,
        brand_name: prod.brand?.name || null,
      }
    })

    return {
      success: true,
      data: slides,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred"

    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
