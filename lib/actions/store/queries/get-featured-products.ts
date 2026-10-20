/**
 * @file lib/actions/store/queries/get-featured-products.ts
 * @description Retrieves a simplified list of featured products, picking the cheapest variant and its specific image.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "../../types/utils"
import type { SimplifiedFeaturedProduct } from "../types"

interface ProductVariantRecord {
  sku: string
  price: number
  compare_at_price?: number | null
}

interface ProductImageRecord {
  url: string
  alt_text?: string | null
  is_primary: boolean
  variant_sku?: string | null
}

interface ProductQueryResult {
  id: string
  name: string
  slug: string
  description?: string | null
  product_variants: ProductVariantRecord[] | null
  product_images: ProductImageRecord[] | null
}

interface GetFeaturedProductsOptions {
  limit?: number
  activeOnly?: boolean
}

export async function getFeaturedProducts(
  options: GetFeaturedProductsOptions = {}
): Promise<ApiResult<SimplifiedFeaturedProduct[]>> {
  const { limit = 10, activeOnly = true } = options

  const supabase = await createServerClient()

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      product_variants (
        sku,
        price,
        compare_at_price
      ),
      product_images (
        url,
        alt_text,
        is_primary,
        variant_sku
      )
    `
    )
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data: productsData, error } = await query

  if (error) {
    console.error("[getFeaturedProducts] Database query failed", {
      code: error.code,
      message: error.message,
    })
    return {
      success: false,
      error: "FETCH_FEATURED_PRODUCTS_ERROR",
      details: { database: [error.message] },
    }
  }

  const rawProducts = (productsData ?? []) as unknown as ProductQueryResult[]

  const simplifiedProducts: SimplifiedFeaturedProduct[] = rawProducts.map((product) => {
    const variants = product.product_variants ?? []
    const images = product.product_images ?? []

    // 1. العثور على المتغير الأرخص (إذا كان هناك متغيرات)
    let cheapestVariant: ProductVariantRecord | null = null
    if (variants.length > 0) {
      cheapestVariant = variants.reduce((prev, curr) => 
        curr.price < prev.price ? curr : prev
      )
    }

    // 2. البحث عن الصورة المرتبطة بالمتغير الأرخص عبر SKU
    let selectedImage: ProductImageRecord | null = null
    if (cheapestVariant?.sku) {
      selectedImage = images.find((img) => img.variant_sku === cheapestVariant?.sku) || null
    }

    if (!selectedImage) {
      selectedImage = 
        images.find((img) => img.is_primary) || 
        images[0] || 
        null
    }



    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: cheapestVariant?.price ?? null,
      compare_at_price: cheapestVariant?.compare_at_price ?? null,
      image_url: selectedImage?.url ?? null,
      image_alt: selectedImage?.alt_text ?? null,
    }
  })

  return { success: true, data: simplifiedProducts }
}