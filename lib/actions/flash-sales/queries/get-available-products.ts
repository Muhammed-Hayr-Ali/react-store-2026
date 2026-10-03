/**
 * @file lib/actions/flash-sales/queries/get-available-products.ts
 * @description Query to retrieve lightweight product records eligible for addition to flash sales.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { SelectableProduct } from "../types"

// ============================================================================
// Internal Types
// ============================================================================

interface RawProductData {
  id: string
  name: string
  slug: string
  product_images?: Array<{
    url: string | null
    is_primary: boolean | null
    sort_order: number | null
  }> | null
  product_variants?: Array<{
    price: number | null
    is_active: boolean | null
  }> | null
}

// ============================================================================
// Main Query Function
// ============================================================================

export async function getAvailableProducts(): Promise<SelectableProduct[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      product_images (url, is_primary, sort_order),
      product_variants (price, is_active)
    `
    )
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error || !data) {
    if (error) {
      console.error("Error in getAvailableProducts:", error.message)
    }
    return []
  }

  const rawProducts = data as unknown as RawProductData[]

  return rawProducts.map((p) => {
    let price = 0
    if (p.product_variants && p.product_variants.length > 0) {
      const prices = p.product_variants
        .filter((v) => v.is_active !== false && typeof v.price === "number")
        .map((v) => v.price as number)
      if (prices.length > 0) {
        price = Math.min(...prices)
      }
    }

    let primaryImageUrl: string | null = null
    if (p.product_images && p.product_images.length > 0) {
      const primaryImg =
        p.product_images.find((img) => img.is_primary) ||
        [...p.product_images].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        )[0]
      primaryImageUrl = primaryImg?.url ?? null
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price,
      primary_image_url: primaryImageUrl,
    }
  })
}
