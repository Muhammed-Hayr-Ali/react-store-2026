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
  "id" | "name" | "name_ar" | "slug" | "parent_id"
>

export type BrandDetail = Pick<
  Tables<"brands">,
  "id" | "name" | "name_ar" | "slug" | "image_url" | "image_alt"
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
          parent_id
        ),
        brand:brands!products_brand_id_fkey (
          id,
          name,
          name_ar,
          slug,
          image_url,
          image_alt
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
          attributes
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
      .order("sort_order", { referencedTable: "product_images", ascending: true })
      .order("id", { referencedTable: "product_images", ascending: true })
      .maybeSingle()

    if (error || !data) return null

    const category = firstOrNull(data.category)
    const brand = firstOrNull(data.brand)

    let parentCategory: CategoryDetail | null = null
    if (category?.parent_id) {
      const { data: parentData } = await supabase
        .from("categories")
        .select("id, name, name_ar, slug, parent_id")
        .eq("id", category.parent_id)
        .maybeSingle()

      parentCategory = parentData ?? null
    }

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
      category,
      parent_category: parentCategory,
      brand,
      product_variants: parseVariants(data.product_variants),
      product_images: data.product_images ?? [],
    }
  },
  ["product-details-cache"],
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
  } catch {
    return {
      success: false,
      error: "FETCH_PRODUCT_ERROR",
    }
  }
}