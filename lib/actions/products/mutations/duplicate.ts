"use server"

/**
 * @file lib/actions/products/duplicate.ts
 * @description Server action for duplicating an existing product along with its variants and images.
 * Generates unique slugs and SKUs for the new copy and correctly remaps image-to-variant relationships.
 */

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import type { ProductVariantItem, ProductImageItem } from "../types"

export type DuplicateProductResult =
  | { success: true }
  | { success: false; error: string }

export async function duplicateProduct(
  productId: string
): Promise<DuplicateProductResult> {
  try {
    const canCreate = await hasPermission(PERMISSIONS.CREATE_PRODUCT)
    if (!canCreate) {
      return { success: false, error: "PERMISSION_DENIED" }
    }

    const supabase = await createServerClient()

    const { data: originalProduct, error: fetchError } = await supabase
      .from("products")
      .select(`
        *,
        product_variants(*),
        product_images(*)
      `)
      .eq("id", productId)
      .single()

    if (fetchError || !originalProduct) {
      return { success: false, error: "FETCH_ORIGINAL_PRODUCT_FAILED" }
    }

    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000).toString()

    const newProductData = {
      brand_id: originalProduct.brand_id,
      category_id: originalProduct.category_id,
      name: `${originalProduct.name} (نسخة)`,
      slug: `${originalProduct.slug}-copy-${uniqueSuffix}`,
      description: originalProduct.description,
      meta_title: originalProduct.meta_title,
      meta_description: originalProduct.meta_description,
      is_active: false,
      is_featured: false,
    }

    const { data: newProduct, error: insertProductError } = await supabase
      .from("products")
      .insert(newProductData)
      .select()
      .single()

    if (insertProductError || !newProduct) {
      return { success: false, error: "DUPLICATE_PRODUCT_FAILED" }
    }

    const skuMapping: Record<string, string> = {}
    const typedVariants = originalProduct.product_variants as ProductVariantItem[] | undefined

    if (typedVariants && typedVariants.length > 0) {
      const variantsToInsert = typedVariants.map((variant) => {
        const newSku = `${variant.sku}-COPY-${uniqueSuffix}`
        skuMapping[variant.sku] = newSku

        return {
          product_id: newProduct.id,
          sku: newSku,
          name: variant.name,
          attributes: variant.attributes,
          price: variant.price,
          compare_at_price: variant.compare_at_price,
          stock_quantity: variant.stock_quantity,
          track_inventory: variant.track_inventory,
          low_stock_threshold: variant.low_stock_threshold,
          expiration_date: variant.expiration_date,
          is_active: variant.is_active,
          sort_order: variant.sort_order,
        }
      })

      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert)

      if (variantsError) {
        await supabase.from("products").delete().eq("id", newProduct.id)
        return { success: false, error: "DUPLICATE_VARIANTS_FAILED" }
      }
    }

    const typedImages = originalProduct.product_images as ProductImageItem[] | undefined

    if (typedImages && typedImages.length > 0) {
      const imagesToInsert = typedImages.map((img) => {
        return {
          product_id: newProduct.id,
          url: img.url,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
          variant_sku: img.variant_sku ? skuMapping[img.variant_sku] : null,
        }
      })

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imagesToInsert)

      if (imagesError) {
        await supabase.from("products").delete().eq("id", newProduct.id)
        return { success: false, error: "DUPLICATE_IMAGES_FAILED" }
      }
    }

    revalidatePath("/dashboard/products")
    revalidatePath(`/products/${newProduct.slug}`)

    return { success: true }
  } catch (error) {
    console.error("[duplicateProduct] Unexpected error:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
