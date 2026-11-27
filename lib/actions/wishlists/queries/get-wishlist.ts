/**
 * @file lib/actions/store/queries/get-wishlist-products.ts
 * @description Retrieves the authenticated user's wishlist as a simplified, paginated list of products, prioritizing primary/general product images before falling back to variant-specific images.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "../../types/utils"

export interface WishlistProduct {
  id: string
  name: string
  slug: string
  description?: string | null
  variantId: string | null
  price: number | null
  compareAtPrice?: number | null
  inStock: boolean
  imageUrl?: string | null
  imageAlt?: string | null
  rating: number
  reviewCount: number
  categoryId: string
  categoryName: string
  categoryNameAr: string
  categorySlug: string
  brandId: string
  brandName: string
  brandNameAr: string
  brandSlug: string
}

interface FilterOptions {
  activeOnly?: boolean
}

export async function getWishlistProducts(
  options: FilterOptions = {}
): Promise<ApiResult<WishlistProduct[]>> {
  const { activeOnly = true } = options

  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // !inner يحوّل الربط إلى inner join ليُستبعد أي صف مفضلة منتجه مفلتر أو غير موجود
  let query = supabase
    .from("wishlists")
    .select(
      `
      id,
      product_id,
      created_at,
      products:product_id!inner (
        id,
        name,
        slug,
        description,
        is_active,
        product_variants (
          id,
          sku,
          price,
          compare_at_price,
          stock_quantity,
          track_inventory
        ),
        product_images (
          url,
          alt_text,
          is_primary,
          variant_id
        ),
        product_reviews (
          rating
        ),
        categories (
          id,
          name,
          name_ar,
          slug
        ),
        brands (
          id,
          name,
          name_ar,
          slug
        )
      )
    `
    )
    .eq("user_id", user.id)

  // is_active عمود في جدول products وليس wishlists
  if (activeOnly) {
    query = query.eq("products.is_active", true)
  }

  // id كترتيب ثانوي لضمان ثبات الصفحات عند تساوي created_at
  query = query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })

  const { data: rows, error } = await query

  if (error) {
    console.error("[getWishlistProducts] Database query failed", {
      code: error.code,
      message: error.message,
    })
    return {
      success: false,
      error: "FETCH_PRODUCTS_ERROR",
      details: { database: [error.message] },
    }
  }

  // استخراج المنتج من كل صف مفضلة وتجاهل أي منتج فارغ
  const rawProducts = (rows ?? [])
    .map((row) => row.products)
    .filter((product) => product !== null)

  const data: WishlistProduct[] = rawProducts.map((product) => {
    const variants = product.product_variants ?? []
    const images = product.product_images ?? []
    const reviews = product.product_reviews ?? []

    // متوسط التقييم وعدد التقييمات
    const reviewCount = reviews.length
    const rating =
      reviewCount > 0
        ? Number(
            (
              reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
            ).toFixed(1)
          )
        : 0

    // المتغير الأرخص
    const cheapestVariant =
      variants.length > 0
        ? variants.reduce((prev, curr) =>
            curr.price < prev.price ? curr : prev
          )
        : null

    // الصورة: رئيسية/عامة أولاً، ثم صورة المتغير الأرخص، ثم أول صورة
    const selectedImage =
      images.find(
        (img) =>
          img.is_primary &&
          (!img.variant_id || img.variant_id === cheapestVariant?.id)
      ) ||
      images.find((img) => img.is_primary) ||
      images.find((img) => !img.variant_id) ||
      (cheapestVariant?.id
        ? images.find((img) => img.variant_id === cheapestVariant.id)
        : undefined) ||
      images[0] ||
      null

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      variantId: cheapestVariant?.id ?? null,
      price: cheapestVariant?.price ?? null,
      compareAtPrice: cheapestVariant?.compare_at_price ?? null,
      inStock: cheapestVariant
        ? !cheapestVariant.track_inventory || cheapestVariant.stock_quantity > 0
        : false,
      imageUrl: selectedImage?.url ?? null,
      imageAlt: selectedImage?.alt_text ?? null,
      rating,
      reviewCount,
      categoryId: product.categories?.id ?? "",
      categoryName: product.categories?.name ?? "",
      categoryNameAr: product.categories?.name_ar ?? "",
      categorySlug: product.categories?.slug ?? "",
      brandId: product.brands?.id ?? "",
      brandName: product.brands?.name ?? "",
      brandNameAr: product.brands?.name_ar ?? "",
      brandSlug: product.brands?.slug ?? "",
    }
  })

  return { success: true, data }
}
