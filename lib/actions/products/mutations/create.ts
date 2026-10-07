/**
 * @file lib/actions/products/mutations/create.ts
 * @description Server Action to create a complete product with variants and images transactionally.
 * Performs permission verification, uniqueness validation, and rollback operations upon sub-insert failure.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Product, CreateProductCompleteInput, CreatedVariant } from "../types"
import { createProductCompleteSchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function createProduct(
  data: CreateProductCompleteInput
): Promise<ApiResult<Product | null>> {
  // 1. Permission check
  const canCreate = await hasPermission(PERMISSIONS.CREATE_PRODUCT)
  if (!canCreate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 2. Validate payload against Zod schema
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
  }

  // 3. Insert primary product record
  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert(cleanProductData)
    .select()
    .single()

  if (productError) {
    if (productError.code === "23505") {
      return { success: false, error: "SLUG_ALREADY_EXISTS" }
    }
    return {
      success: false,
      error: "CREATE_PRODUCT_ERROR",
      details: { database: [productError.message] },
    }
  }

  const productId = newProduct.id

  // Helper rollback function to cleanup primary record if children fail
  const rollbackAll = async () => {
    await supabase.from("products").delete().eq("id", productId)
  }

  let createdVariants: CreatedVariant[] = []

  // 4. Insert variants
  if (variants.length > 0) {
    const variantsPayload = variants.map((v, idx) => ({
      product_id: productId,
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
      await rollbackAll()
      if (variantsError.code === "23505") {
        return { success: false, error: "SKU_ALREADY_EXISTS" }
      }
      return {
        success: false,
        error: "CREATE_VARIANTS_ERROR",
        details: { database: [variantsError.message] },
      }
    }

    createdVariants = (variantsData || []) as CreatedVariant[]
  }

  // 5. Insert images
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
        product_id: productId,
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
      await rollbackAll()
      return {
        success: false,
        error: "CREATE_IMAGES_ERROR",
        details: { database: [imagesError.message] },
      }
    }
  }

  // 6. Revalidate routes
  revalidatePath("/", "layout")

  return {
    success: true,
    data: newProduct as Product,
  }
}
