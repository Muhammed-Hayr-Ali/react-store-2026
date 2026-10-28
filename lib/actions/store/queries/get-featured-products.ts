/**
 * @file lib/actions/store/queries/get-featured-products.ts
 * @description Retrieves a simplified list of featured products, picking the cheapest variant and prioritizing primary product images, falling back to variant-specific images.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "../../types/utils"

interface ProductVariantRecord {
  id: string // الـ id الخاص بالمتغير
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

export interface SimplifiedFeaturedProduct {
  id: string
  name: string
  slug: string
  description?: string | null
  variant_id: string | null // معرف المتغير الأرخص
  price: number | null
  compare_at_price?: number | null
  image_url?: string | null
  image_alt?: string | null
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
        id,
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

    // 2. البحث عن الصورة الافتراضية للمنتج أولاً (is_primary أو أول صورة عامة بدون variant_sku أو العامة)
    let selectedImage: ProductImageRecord | null = null
    
    // محاولة إيجاد الصورة الأساسية المحددة كـ primary ولا تتبع متغير محدد أو عامة
    selectedImage = 
      images.find((img) => img.is_primary && (!img.variant_sku || img.variant_sku === cheapestVariant?.sku)) ||
      images.find((img) => img.is_primary) || 
      images.find((img) => !img.variant_sku) ||
      null

    // 3. إن لم توجد صورة افتراضية عامة، نبحث عن صورة المتغير الأرخص عبر الـ SKU
    if (!selectedImage && cheapestVariant?.sku) {
      selectedImage = images.find((img) => img.variant_sku === cheapestVariant?.sku) || null
    }

    // 4. إن لم نجد أي شروط سابقة، نأخذ أول صورة متوفرة كحل أخير
    if (!selectedImage && images.length > 0) {
      selectedImage = images[0]
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      variant_id: cheapestVariant?.id ?? null,
      price: cheapestVariant?.price ?? null,
      compare_at_price: cheapestVariant?.compare_at_price ?? null,
      image_url: selectedImage?.url ?? null,
      image_alt: selectedImage?.alt_text ?? null,
    }
  })

  return { success: true, data: simplifiedProducts }
}