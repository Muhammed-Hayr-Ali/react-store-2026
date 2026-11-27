/**
 * @file lib/actions/store/product-details/queries/get-product-details.ts
 * @description Retrieves full product details including variants with robust Next.js unstable_cache support and strict typing.
 */

"use server"

import { unstable_cache } from "next/cache"
import type { ApiResult } from "@/lib/actions/types/utils"
import { createPublicServerClient } from "@/lib/database/supabase/public"
import { CACHE_TAG } from "@/lib/config/app_config"
import type { Tables } from "@/lib/database/supabase/types"
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

const getCachedProductDetails = unstable_cache(
  async (slug: string): Promise<FullProductDetails | null> => {
    const supabase = await createPublicServerClient()

    const { data: productData, error } = await supabase
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
      .order("sort_order", {
        referencedTable: "product_images",
        ascending: true,
      })
      .order("id", {
        referencedTable: "product_images",
        ascending: true,
      })
      .maybeSingle()

    if (error || !productData) {
      return null
    }

    const rawProduct = productData

    let processedCategory: CategoryDetail | null = null
    if (rawProduct.category) {
      const cat = Array.isArray(rawProduct.category)
        ? rawProduct.category[0]
        : rawProduct.category

      if (cat) {
        processedCategory = {
          id: cat.id,
          name: cat.name,
          name_ar: cat.name_ar,
          slug: cat.slug,
          parent_id: cat.parent_id,
        }
      }
    }

    let parentCategory: CategoryDetail | null = null
    if (processedCategory?.parent_id) {
      const { data: parentData } = await supabase
        .from("categories")
        .select("id, name, name_ar, slug, parent_id")
        .eq("id", processedCategory.parent_id)
        .maybeSingle()

      if (parentData) {
        parentCategory = parentData
      }
    }

    let processedBrand: BrandDetail | null = null
    if (rawProduct.brand) {
      const brd = Array.isArray(rawProduct.brand)
        ? rawProduct.brand[0]
        : rawProduct.brand

      if (brd) {
        processedBrand = {
          id: brd.id,
          name: brd.name,
          name_ar: brd.name_ar,
          slug: brd.slug,
          image_url: brd.image_url,
          image_alt: brd.image_alt,
        }
      }
    }

    const allImages = [...(rawProduct.product_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)
    )
    const variantSpecificImages = allImages.filter(
      (img) => img.variant_id !== null
    )

    const productVariants: ProductVariantDetail[] = []
    for (const variant of rawProduct.product_variants ?? []) {
      if (
        variant.attributes !== null &&
        !isProductAttributes(variant.attributes)
      ) {
        throw new Error(
          `Product variant "${variant.id}" has invalid attributes data.`
        )
      }

      productVariants.push({
        ...variant,
        attributes: variant.attributes,
      })
    }

    const formattedProduct: FullProductDetails = {
      id: rawProduct.id,
      name: rawProduct.name,
      slug: rawProduct.slug,
      description: rawProduct.description,
      is_active: rawProduct.is_active,
      is_featured: rawProduct.is_featured,
      meta_title: rawProduct.meta_title,
      meta_description: rawProduct.meta_description,
      created_at: rawProduct.created_at,
      category: processedCategory,
      parent_category: parentCategory,
      brand: processedBrand,
      product_variants: productVariants,
      product_images: variantSpecificImages,
    }

    return formattedProduct
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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error"

    console.error("[getProductDetails] Failed to retrieve product", {
      slug,
      message: errorMessage,
    })

    return {
      success: false,
      error: "FETCH_PRODUCT_ERROR",
    }
  }
}
