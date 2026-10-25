/**
 * @file lib/actions/store/queries/get-latest-regular-products.ts
 * @description Retrieves a simplified list of non-featured regular products including variant ID and reviews summary.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "../../types/utils"

interface ProductVariantRecord {
  id: string
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

// تعريف سجل الريفيو القادم من قاعدة البيانات
interface ProductReviewRecord {
  rating: number
}

interface ProductQueryResult {
  id: string
  name: string
  slug: string
  description?: string | null
  product_variants: ProductVariantRecord[] | null
  product_images: ProductImageRecord[] | null
  product_reviews: ProductReviewRecord[] | null // العلاقة مع جدول الريفيوهات
}

export interface SimplifiedRegularProduct {
  id: string
  name: string
  slug: string
  description?: string | null
  variant_id: string | null
  price: number | null
  compare_at_price?: number | null
  image_url?: string | null
  image_alt?: string | null
  rating: number      // متوسط التقييم (مثلاً 4.5)
  review_count: number // عدد التقييمات الإجمالي
}

interface GetLatestRegularProductsOptions {
  limit?: number
  activeOnly?: boolean
}

export async function getLatestRegularProducts(
  options: GetLatestRegularProductsOptions = {}
): Promise<ApiResult<SimplifiedRegularProduct[]>> {
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
      ),
      product_reviews (
        rating
      )
    `
    )
    .eq("is_featured", false)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data: productsData, error } = await query

  if (error) {
    console.error("[getLatestRegularProducts] Database query failed", {
      code: error.code,
      message: error.message,
    })
    return {
      success: false,
      error: "FETCH_REGULAR_PRODUCTS_ERROR",
      details: { database: [error.message] },
    }
  }

  const rawProducts = (productsData ?? []) as unknown as ProductQueryResult[]

  const simplifiedProducts: SimplifiedRegularProduct[] = rawProducts.map((product) => {
    const variants = product.product_variants ?? []
    const images = product.product_images ?? []
    const reviews = product.product_reviews ?? []

    // 1. حساب متوسط التقييم وعدد التقييمات
    const review_count = reviews.length
    const rating = review_count > 0 
      ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / review_count).toFixed(1))
      : 0

    // 2. العثور على المتغير الأرخص
    let cheapestVariant: ProductVariantRecord | null = null
    if (variants.length > 0) {
      cheapestVariant = variants.reduce((prev, curr) => 
        curr.price < prev.price ? curr : prev
      )
    }

    // 3. البحث عن الصورة المرتبطة
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
      variant_id: cheapestVariant?.id ?? null,
      price: cheapestVariant?.price ?? null,
      compare_at_price: cheapestVariant?.compare_at_price ?? null,
      image_url: selectedImage?.url ?? null,
      image_alt: selectedImage?.alt_text ?? null,
      rating,
      review_count,
    }
  })

  return { success: true, data: simplifiedProducts }
}