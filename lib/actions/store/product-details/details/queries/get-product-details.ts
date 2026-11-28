/**
 * @file lib/actions/store/product-details/queries/get-product-details.ts
 * @description Retrieves full product details including variants with Next.js unstable_cache support and strict typing.
 */

"use server"

import { unstable_cache } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import type { ApiResult } from "@/lib/actions/types/utils"
import { CACHE_TAG } from "@/lib/config/app_config"
import type { Database, Tables } from "@/lib/database/supabase/types"
import { isProductAttributes } from "@/lib/actions/products/types"

export type ProductVariantDetail = Omit<
  Pick<
    Tables<"product_variants">,
    | "id"
    | "sku"
    | "name"
    | "price"
    | "compare_at_price"
    | "stock_quantity"
    | "track_inventory"
    | "is_active"
    | "attributes"
    | "low_stock_threshold"
    | "sort_order"
  >,
  "attributes"
> & {
  attributes: Record<string, string | number | boolean> | null
}

export type ProductImageDetail = Pick<
  Tables<"product_images">,
  "id" | "url" | "alt_text" | "is_primary" | "sort_order" | "variant_id"
>

export type CategoryDetail = Pick<
  Tables<"categories">,
  "id" | "name" | "name_ar" | "slug" | "parent_id" | "is_active"
>

export type BrandDetail = Pick<
  Tables<"brands">,
  "id" | "name" | "name_ar" | "slug" | "image_url" | "image_alt" | "is_active"
>

export type FullProductDetails = Pick<
  Tables<"products">,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "is_active"
  | "is_featured"
  | "created_at"
  | "meta_title"
  | "meta_description"
> & {
  category: CategoryDetail | null
  parent_category: CategoryDetail | null
  brand: BrandDetail | null
  product_variants: ProductVariantDetail[]
  product_images: ProductImageDetail[]
}

type RawProductVariant = Omit<ProductVariantDetail, "attributes"> & {
  attributes: unknown
}

function createCacheClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error("Missing Supabase public environment variables.")
  }
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function parseVariants(
  variants: RawProductVariant[] | null | undefined
): ProductVariantDetail[] {
  if (!variants?.length) return []

  return variants.map((variant) => {
    const attrs = variant.attributes

    if (attrs !== null && attrs !== undefined) {
      if (!isProductAttributes(attrs as never)) {
        throw new Error(
          `Product variant "${variant.id}" has invalid attributes data.`
        )
      }
    }

    return {
      ...variant,
      attributes:
        attrs && typeof attrs === "object" && !Array.isArray(attrs)
          ? (attrs as Record<string, string | number | boolean>)
          : null,
    }
  })
}

const getCachedProductDetails = unstable_cache(
  async (slug: string): Promise<FullProductDetails | null> => {
    const supabase = createCacheClient()

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        is_active,
        is_featured,
        created_at,
        meta_title,
        meta_description,
        category:categories!products_category_id_fkey (
          id,
          name,
          name_ar,
          slug,
          parent_id,
          is_active
        ),
        brand:brands!products_brand_id_fkey (
          id,
          name,
          name_ar,
          slug,
          image_url,
          image_alt,
          is_active
        ),
        product_variants (
          id,
          sku,
          name,
          price,
          compare_at_price,
          stock_quantity,
          track_inventory,
          is_active,
          attributes,
          low_stock_threshold,
          sort_order
        ),
        product_images (
          id,
          url,
          alt_text,
          is_primary,
          sort_order,
          variant_id
        )
      `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      // فلترة المتغيرات غير المفعّلة دون استبعاد المنتج نفسه
      .eq("product_variants.is_active", true)
      .order("sort_order", {
        referencedTable: "product_variants",
        ascending: true,
      })
      .order("id", { referencedTable: "product_variants", ascending: true })
      .order("sort_order", { referencedTable: "product_images", ascending: true })
      .order("id", { referencedTable: "product_images", ascending: true })
      .maybeSingle()

    // رمي الخطأ يمنع تخزين فشل مؤقت في الكاش على أنه "منتج غير موجود"
    if (error) throw new Error(error.message)
    if (!data) return null

    const category = firstOrNull(data.category)
    const brand = firstOrNull(data.brand)

    let parentCategory: CategoryDetail | null = null
    if (category?.parent_id) {
      const { data: parentData, error: parentError } = await supabase
        .from("categories")
        .select("id, name, name_ar, slug, parent_id, is_active")
        .eq("id", category.parent_id)
        .maybeSingle()

      if (parentError) throw new Error(parentError.message)

      parentCategory = parentData ?? null
    }

    const variants = parseVariants(data.product_variants)
    const activeVariantIds = new Set(variants.map((v) => v.id))

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      is_active: data.is_active,
      is_featured: data.is_featured,
      created_at: data.created_at,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      // is_active في categories يقبل null، لذلك نستبعد false فقط
      category: category?.is_active === false ? null : category,
      parent_category:
        parentCategory?.is_active === false ? null : parentCategory,
      brand: brand?.is_active ? brand : null,
      product_variants: variants,
      // استبعاد صور المتغيرات غير المفعّلة
      product_images: (data.product_images ?? []).filter(
        (img) => !img.variant_id || activeVariantIds.has(img.variant_id)
      ),
    }
  },
  ["product-details-cache-v2"],
  {
    revalidate: 3600,
    tags: [CACHE_TAG.PRODUCTS],
  }
)

export async function getProductDetails(
  slug: string
): Promise<ApiResult<FullProductDetails>> {
  if (!slug || typeof slug !== "string") {
    return {
      success: false,
      error: "INVALID_SLUG",
      details: { database: ["Product slug is required."] },
    }
  }

  try {
    const product = await getCachedProductDetails(slug)

    if (!product) {
      return {
        success: false,
        error: "PRODUCT_NOT_FOUND",
        details: { database: [`No active product found for slug: ${slug}`] },
      }
    }

    return { success: true, data: product }
  } catch (error) {
    console.error("[getProductDetails]", slug, error)
    return {
      success: false,
      error: "FETCH_PRODUCT_ERROR",
    }
  }
}