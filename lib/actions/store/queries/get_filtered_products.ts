/**
 * @file lib/actions/store/queries/get-filtered-products.ts
 * @description Retrieves a simplified, paginated list of products with robust Next.js unstable_cache support.
 */

"use server"

import { unstable_cache } from "next/cache"
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
  categoryName: string
  categorySlug: string
  brandId: string
  brandName: string
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

// دالة الكاش الداخلية تستقبل القيم المفردة لتثبيت مفتاح التخزين المؤقت بدقة
const getCachedFilteredProducts = unstable_cache(
  async (
    categoryId?: string,
    categorySlug?: string,
    brandId?: string,
    brandSlug?: string,
    is_featured: boolean = false,
    limit: number = 12,
    page: number = 1,
    activeOnly: boolean = true
  ): Promise<SimpliProduct[]> => {
    const from = (Math.max(page, 1) - 1) * limit
    const to = from + limit - 1

    const supabase = await createServerClient()

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

    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to)

    const { data: productsData, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const rawProducts = (productsData ?? []) as unknown as ProductQueryResult[]

    return rawProducts.map((product) => {
      const variants = product.product_variants ?? []
      const images = product.product_images ?? []
      const reviews = product.product_reviews ?? []

      const reviewCount = reviews.length
      const rating =
        reviewCount > 0
          ? Number(
              (
                reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
              ).toFixed(1)
            )
          : 0

      const cheapestVariant =
        variants.length > 0
          ? variants.reduce((prev, curr) =>
              curr.price < prev.price ? curr : prev
            )
          : null

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
  },
  ["filtered-products-cache"],
  {
    revalidate: 1800, // إعادة التحقق كل نصف ساعة مثلاً
    tags: ["products"], // لتحديث الكاش تلقائياً عبر revalidateTag عند التعديل
  }
)

export async function getFilteredProducts(
  options: FilterOptions = {}
): Promise<ApiResult<SimpliProduct[]>> {
  const {
    categoryId,
    categorySlug,
    brandId,
    brandSlug,
    is_featured = false,
    limit = 12,
    page = 1,
    activeOnly = true,
  } = options

  try {
    const data = await getCachedFilteredProducts(
      categoryId,
      categorySlug,
      brandId,
      brandSlug,
      is_featured,
      limit,
      page,
      activeOnly
    )

    return { success: true, data }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error"

    console.error("[getFilteredProducts] Database query failed", {
      message: errorMessage,
    })

    return {
      success: false,
      error: "FETCH_PRODUCTS_ERROR",
      details: { database: [errorMessage] },
    }
  }
}