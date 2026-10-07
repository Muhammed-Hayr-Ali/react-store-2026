/**
 * @file lib/actions/products/mutations/update.ts
 * @description Server Action to update an existing product, syncing variants and gallery images.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Product, CreateProductCompleteInput, CreatedVariant } from "../types"
import { createProductCompleteSchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function updateProduct(
  productId: string,
  data: CreateProductCompleteInput
): Promise<ApiResult<Product | null>> {
  // 1. Validate Product ID
  const idValidation = z
    .string()
    .uuid("INVALID_PRODUCT_ID")
    .safeParse(productId)
  if (!idValidation.success) {
    return { success: false, error: "INVALID_PRODUCT_ID" }
  }
  const validProductId = idValidation.data

  // 2. Permission check
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_PRODUCT)
  if (!canUpdate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Validate payload
  const validation = createProductCompleteSchema.safeParse(data)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: fieldErrors,
    }
  }

  const supabase = await createServerClient()
  const { variants, images, ...productOnlyData } = validation.data

  const cleanProductData = {
    ...productOnlyData,
    slug: productOnlyData.slug.trim().toLowerCase(),
    brand_id: productOnlyData.brand_id || null,
    description: productOnlyData.description || null,
    meta_title: productOnlyData.meta_title || null,
    meta_description: productOnlyData.meta_description || null,
    updated_at: new Date().toISOString(),
  }

  // 4. Update primary product record
  const { data: updatedProduct, error: productError } = await supabase
    .from("products")
    .update(cleanProductData)
    .eq("id", validProductId)
    .select()
    .single()

  if (productError) {
    if (productError.code === "23505") {
      return { success: false, error: "SLUG_ALREADY_EXISTS" }
    }
    return {
      success: false,
      error: "UPDATE_PRODUCT_ERROR",
      details: { database: [productError.message] },
    }
  }

  // 5. Synchronize variants: delete old variants and insert updated set
  const { error: deleteVariantsError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", validProductId)

  if (deleteVariantsError) {
    return {
      success: false,
      error: "UPDATE_VARIANTS_ERROR",
      details: { database: [deleteVariantsError.message] },
    }
  }

  let createdVariants: CreatedVariant[] = []

  if (variants.length > 0) {
    const variantsPayload = variants.map((v, idx) => ({
      product_id: validProductId,
      sku: v.sku.trim(),
      name: v.name?.trim() || null,
      attributes:
        v.attributes && Object.keys(v.attributes).length > 0
          ? v.attributes
          : {},
      price: Math.round(Number(v.price) * 100),
      compare_at_price: v.compare_at_price
        ? Math.round(Number(v.compare_at_price) * 100)
        : null,
      stock_quantity: Number(v.stock_quantity),
      track_inventory: Boolean(v.track_inventory),
      low_stock_threshold: Number(v.low_stock_threshold),
      is_active: Boolean(v.is_active),
      sort_order: v.sort_order ?? idx + 1,
    }))

    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantsPayload)
      .select("id, sku")

    if (variantsError) {
      if (variantsError.code === "23505") {
        return { success: false, error: "SKU_ALREADY_EXISTS" }
      }
      return {
        success: false,
        error: "UPDATE_VARIANTS_ERROR",
        details: { database: [variantsError.message] },
      }
    }

    createdVariants = (variantsData || []) as CreatedVariant[]
  }

  // 6. Synchronize images: delete old images and insert updated set
  const { error: deleteImagesError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", validProductId)

  if (deleteImagesError) {
    return {
      success: false,
      error: "UPDATE_IMAGES_ERROR",
      details: { database: [deleteImagesError.message] },
    }
  }

  if (images.length > 0) {
    const imagesPayload = images.map((img) => {
      let targetVariantId: string | null = null

      if (img.variant_sku?.trim()) {
        const cleanSku = img.variant_sku.trim().toLowerCase()
        const matchedVariant = createdVariants.find(
          (v) => v.sku.trim().toLowerCase() === cleanSku
        )
        if (matchedVariant) targetVariantId = matchedVariant.id
      }

      return {
        product_id: validProductId,
        variant_id: targetVariantId,
        url: img.url.trim(),
        alt_text: img.alt_text?.trim() || null,
        is_primary: Boolean(img.is_primary),
        sort_order: 0,
      }
    })

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imagesPayload)

    if (imagesError) {
      return {
        success: false,
        error: "UPDATE_IMAGES_ERROR",
        details: { database: [imagesError.message] },
      }
    }
  }

  // 7. Invalidate caches
  revalidatePath(`/product/${updatedProduct.slug}`)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: updatedProduct as Product,
  }
}
