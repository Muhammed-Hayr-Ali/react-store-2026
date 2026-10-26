/**
 * @file lib/actions/wishlists/queries/get-wishlist.ts
 * @description Retrieves a simplified list of user's wishlist products supporting pagination for infinite scroll.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import type { SimplifiedRegularProduct } from "@/lib/actions/store/queries/get-latest-regular-products"

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

interface ProductReviewRecord {
  rating: number
}

interface ProductQueryResult {
  id: string
  name: string
  slug: string
  description?: string | null
  is_active: boolean
  product_variants: ProductVariantRecord[] | null
  product_images: ProductImageRecord[] | null
  product_reviews: ProductReviewRecord[] | null
}

interface WishlistQueryResult {
  id: string
  product_id: string
  created_at: string
  products: ProductQueryResult | null
}

interface GetWishlistOptions {
  limit?: number
  page?: number
  activeOnly?: boolean
}

export async function getWishlist(
  options: GetWishlistOptions = {}
): Promise<ApiResult<SimplifiedRegularProduct[]>> {
  const { limit = 12, page = 1, activeOnly = true } = options

  // حساب نطاق الـ Pagination لـ Supabase
  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const { data: wishlistData, error } = await supabase
    .from("wishlists")
    .select(
      `
      id,
      product_id,
      created_at,
      products:product_id (
        id,
        name,
        slug,
        description,
        is_active,
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
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to) // استخدام range لدعم الصفحات

  if (error) {
    console.error("[getWishlist] Database query failed", {
      code: error.code,
      message: error.message,
    })
    return {
      success: false,
      error: "GET_WISHLIST_ERROR",
      details: { database: [error.message] },
    }
  }

  const rawWishlist = (wishlistData ?? []) as unknown as WishlistQueryResult[]

  // استخراج المنتجات وتسطيحها لتطابق SimplifiedRegularProduct
  const simplifiedProducts: SimplifiedRegularProduct[] = []

  for (const item of rawWishlist) {
    const product = item.products
    if (!product) continue

    if (activeOnly && !product.is_active) {
      continue
    }

    const variants = product.product_variants ?? []
    const images = product.product_images ?? []
    const reviews = product.product_reviews ?? []

    // حساب متوسط التقييم وعدد التقييمات
    const review_count = reviews.length
    const rating =
      review_count > 0
        ? Number(
            (
              reviews.reduce((acc, curr) => acc + curr.rating, 0) /
              review_count
            ).toFixed(1)
          )
        : 0

    // العثور على المتغير الأرخص
    let cheapestVariant: ProductVariantRecord | null = null
    if (variants.length > 0) {
      cheapestVariant = variants.reduce((prev, curr) =>
        curr.price < prev.price ? curr : prev
      )
    }

    // البحث عن الصورة المرتبطة
    let selectedImage: ProductImageRecord | null = null
    if (cheapestVariant?.sku) {
      selectedImage =
        images.find((img) => img.variant_sku === cheapestVariant?.sku) || null
    }

    if (!selectedImage) {
      selectedImage =
        images.find((img) => img.is_primary) || images[0] || null
    }

    simplifiedProducts.push({
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
    })
  }

  return { success: true, data: simplifiedProducts }
}