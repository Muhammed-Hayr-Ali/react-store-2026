/**
 * @file lib/actions/store/queries/get-filtered-products.ts
 * @description Retrieves a simplified, paginated list of products with optional category/featured filters, prioritizing primary/general product images before falling back to variant-specific images.
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

interface ProductReviewRecord {
  rating: number
}

interface ProductCategoriesRecord {
  id: string
  name: string
  name_ar: string
  slug: string
}

interface ProductBrandsRecord {
  id: string
  name: string
  name_ar: string
  slug: string
}

interface ProductQueryResult {
  id: string
  name: string
  slug: string
  is_active: boolean
  description?: string | null
  product_variants: ProductVariantRecord[] | null
  product_images: ProductImageRecord[] | null
  product_reviews: ProductReviewRecord[] | null
  categories: ProductCategoriesRecord | null
  brands: ProductBrandsRecord | null
}

export interface SimpliProduct {
  id: string
  name: string
  slug: string
  description?: string | null
  variantId: string | null
  price: number | null
  compareAtPrice?: number | null
  imageUrl?: string | null
  imageAlt?: string | null
  rating: number
  reviewCount: number
  categoryId: string
  categorySlug: string
  brandId: string
  brandSlug: string
}

interface FilterOptions {
  categoryId?: string
  categorySlug?: string
  brandId?: string
  brandSlug?: string
  is_featured?: boolean
  limit?: number
  page?: number
  activeOnly?: boolean
}

export async function getFilteredProducts(
  options: FilterOptions = {}
): Promise<ApiResult<SimpliProduct[]>> {
  const {
    categoryId,
    categorySlug,
    brandId,
    brandSlug,
    is_featured,
    limit = 12,
    page = 1,
    activeOnly = true,
  } = options

  const from = (Math.max(page, 1) - 1) * limit
  const to = from + limit - 1

  const supabase = await createServerClient()

  // !inner يحوّل الربط إلى inner join ليُستبعد ما هو خارج الفئة المطلوبة
  let query = supabase.from("products").select(
    `
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
      ),
      categories${categorySlug ? "!inner" : ""} (
        id,
        name,
        name_ar,
        slug
      ),
      brands${brandSlug ? "!inner" : ""} (
        id,
        name,
        name_ar,
        slug
      )
    `
  )

  // الفلاتر أولاً ثم الترتيب والـ Pagination
  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }
  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug)
  }

  if (brandId) {
    query = query.eq("brand_id", brandId)
  }
  if (brandSlug) {
    query = query.eq("brands.slug", brandSlug)
  }

  if (is_featured !== undefined) {
    query = query.eq("is_featured", is_featured)
  }
  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  // id كترتيب ثانوي لضمان ثبات الصفحات عند تساوي created_at
  query = query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to)

  const { data: productsData, error } = await query

  if (error) {
    console.error("[getFilteredProducts] Database query failed", {
      code: error.code,
      message: error.message,
    })
    return {
      success: false,
      error: "FETCH_PRODUCTS_ERROR",
      details: { database: [error.message] },
    }
  }

  const rawProducts = (productsData ?? []) as unknown as ProductQueryResult[]

  const data: SimpliProduct[] = rawProducts.map((product) => {
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
          (!img.variant_sku || img.variant_sku === cheapestVariant?.sku)
      ) ||
      images.find((img) => img.is_primary) ||
      images.find((img) => !img.variant_sku) ||
      (cheapestVariant?.sku
        ? images.find((img) => img.variant_sku === cheapestVariant.sku)
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
      imageUrl: selectedImage?.url ?? null,
      imageAlt: selectedImage?.alt_text ?? null,
      rating,
      reviewCount,
      categoryId: product.categories?.id ?? "",
      categoryName: product.categories?.name ?? "",
      categorySlug: product.categories?.slug ?? "",
      brandId: product.brands?.id ?? "",
      brandName: product.brands?.name ?? "",
      brandSlug: product.brands?.slug ?? "",
    }
  })

  return { success: true, data: data }
}
