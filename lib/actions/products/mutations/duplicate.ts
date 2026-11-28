"use server"

/**
 * @file lib/actions/products/mutations/duplicate.ts
 * @description Server action for duplicating an existing product along with its variants and images.
 * Generates unique slugs and SKUs for the new copy and correctly remaps image-to-variant relationships.
 */

import { revalidatePath, revalidateTag } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { CACHE_TAG } from "@/lib/config/app_config"

export type DuplicateProductResult =
  | { success: true }
  | { success: false; error: string }

interface DuplicatedVariantRow {
  id: string
  sku: string
  name: string | null
  attributes: Record<string, string> | null
  price: number
  compare_at_price: number | null
  stock_quantity: number
  track_inventory: boolean
  low_stock_threshold: number
  expiration_date: string | null
  is_active: boolean
  sort_order: number
}

interface DuplicatedImageRow {
  id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
  variant_id: string | null
}

export async function duplicateProduct(
  productId: string
): Promise<DuplicateProductResult> {
  try {
    const supabase = await createServerClient()

    const { data: originalProduct, error: fetchError } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants(*),
        product_images(*)
      `
      )
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

    const variantIdMapping = new Map<string, string>()
    const typedVariants: DuplicatedVariantRow[] = Array.isArray(
      originalProduct.product_variants
    )
      ? (originalProduct.product_variants as DuplicatedVariantRow[])
      : []

    if (typedVariants.length > 0) {
      const originalVariantIdByNewSku = new Map<string, string>()
      const variantsToInsert = typedVariants.map(
        (variant: DuplicatedVariantRow) => {
          const newSku = `${variant.sku}-COPY-${uniqueSuffix}`
          originalVariantIdByNewSku.set(newSku, variant.id)

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
        }
      )

      const { data: insertedVariants, error: variantsError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert)
        .select("id, sku")

      if (
        variantsError ||
        !insertedVariants ||
        insertedVariants.length !== variantsToInsert.length
      ) {
        console.error("[duplicateProduct] Failed to insert variants", {
          productId: newProduct.id,
          error:
            variantsError ?? "Variant rows were not returned after insert.",
        })
        await supabase.from("products").delete().eq("id", newProduct.id)
        return { success: false, error: "DUPLICATE_VARIANTS_FAILED" }
      }

      for (const insertedVariant of insertedVariants) {
        const originalVariantId = originalVariantIdByNewSku.get(
          insertedVariant.sku
        )
        if (originalVariantId) {
          variantIdMapping.set(originalVariantId, insertedVariant.id)
        }
      }
    }

    const typedImages: DuplicatedImageRow[] = Array.isArray(
      originalProduct.product_images
    )
      ? (originalProduct.product_images as DuplicatedImageRow[])
      : []

    if (typedImages.length > 0) {
      const imagesToInsert = [...typedImages]
        .sort(
          (a: DuplicatedImageRow, b: DuplicatedImageRow) =>
            a.sort_order - b.sort_order || a.id.localeCompare(b.id)
        )
        .map((img: DuplicatedImageRow, sort_order: number) => {
          return {
            product_id: newProduct.id,
            url: img.url,
            alt_text: img.alt_text,
            is_primary: img.is_primary,
            sort_order,
            variant_id: img.variant_id
              ? (variantIdMapping.get(img.variant_id) ?? null)
              : null,
          }
        })

      if (
        typedImages.some(
          (img: DuplicatedImageRow) =>
            img.variant_id && !variantIdMapping.has(img.variant_id)
        )
      ) {
        console.error(
          "[duplicateProduct] Image references an unmapped variant",
          {
            productId: newProduct.id,
          }
        )
        await supabase.from("products").delete().eq("id", newProduct.id)
        return { success: false, error: "DUPLICATE_IMAGES_FAILED" }
      }

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imagesToInsert)

      if (imagesError) {
        await supabase.from("products").delete().eq("id", newProduct.id)
        return { success: false, error: "DUPLICATE_IMAGES_FAILED" }
      }
    }

    revalidateTag(CACHE_TAG.PRODUCTS, { expire: 0 })
    revalidatePath("/", "layout")

    return { success: true }
  } catch (error) {
    console.error("[duplicateProduct] Unexpected error:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}