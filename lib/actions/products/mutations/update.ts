/**
 * @file lib/actions/products/mutations/update.ts
 * @description Server action for updating an existing product, its variants, and images.
 * Updates existing variants by ID and inserts new variants cleanly so PostgreSQL generates UUIDs.
 */

"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { updateProductSchema, type UpdateProductInput } from "../schemas"
import { CACHE_TAG } from "@/lib/config/app_config"
import { normalizePrimaryImages } from "../normalize-primary-images"

export type UpdateProductResult =
  | { success: true }
  | {
      success: false
      error: string
      details?: Record<string, string[] | undefined>
    }

function logDatabaseError(
  stage: string,
  error: {
    code?: string
    message: string
    details?: string | null
    hint?: string | null
  }
) {
  console.error(`[updateProduct] ${stage} failed`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  })
}

function formatPostgrestInList(values: string[]): string {
  const escaped = values.map((val) => `"${val.replaceAll('"', '\\"')}"`)
  return `(${escaped.join(",")})`
}

export async function updateProduct(
  input: UpdateProductInput
): Promise<UpdateProductResult> {
  try {
    const validation = updateProductSchema.safeParse(input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.some(
          (issue) => issue.message === "DUPLICATE_VARIANT_SKU"
        )
          ? "DUPLICATE_VARIANT_SKU"
          : "VALIDATION_ERROR",
        details: validation.error.flatten().fieldErrors,
      }
    }

    const { id, variants, images, ...productData } = validation.data
    const supabase = await createServerClient()

    const { count: slugCount, error: slugError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("slug", productData.slug)
      .neq("id", id)

    if (slugError) {
      logDatabaseError("Check product slug", slugError)
      return {
        success: false,
        error: "DATABASE_ERROR",
        details: { database: [slugError.message] },
      }
    }

    if (slugCount && slugCount > 0) {
      return { success: false, error: "PRODUCT_SLUG_ALREADY_EXISTS" }
    }

    const incomingSkus = variants.map((variant) => variant.sku)
    const { data: matchingVariants, error: skuCheckError } = await supabase
      .from("product_variants")
      .select("id, sku, product_id")
      .in("sku", incomingSkus)

    if (skuCheckError) {
      logDatabaseError("Check variant SKUs", skuCheckError)
      return {
        success: false,
        error: "DATABASE_ERROR",
        details: { database: [skuCheckError.message] },
      }
    }

    if (matchingVariants?.some((variant) => variant.product_id !== id)) {
      return { success: false, error: "VARIANT_SKU_ALREADY_EXISTS" }
    }

    const existingVariantIdsBySku = new Map(
      (matchingVariants ?? [])
        .filter((variant) => variant.product_id === id)
        .map((variant) => [variant.sku, variant.id])
    )

    const { error: updateError } = await supabase
      .from("products")
      .update({
        ...productData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      logDatabaseError("Update product", updateError)
      return {
        success: false,
        error: "UPDATE_PRODUCT_FAILED",
        details: { database: [updateError.message] },
      }
    }

    const variantsToUpdate = variants
      .filter((variant) => existingVariantIdsBySku.has(variant.sku))
      .map((variant) => ({
        ...variant,
        id: existingVariantIdsBySku.get(variant.sku)!,
        product_id: id,
        expiration_date: variant.expiration_date || null,
      }))

    const variantsToInsert = variants
      .filter((variant) => !existingVariantIdsBySku.has(variant.sku))
      .map((variant) => ({
        ...variant,
        product_id: id,
        expiration_date: variant.expiration_date || null,
      }))

    for (const variantRow of variantsToUpdate) {
      const { id: variantId, ...variantPayload } = variantRow
      const { error: updateVariantError } = await supabase
        .from("product_variants")
        .update(variantPayload)
        .eq("id", variantId)
        .eq("product_id", id)

      if (updateVariantError) {
        logDatabaseError("Update existing variant", updateVariantError)
        return {
          success: false,
          error:
            updateVariantError.code === "23505"
              ? "VARIANT_SKU_ALREADY_EXISTS"
              : "UPDATE_VARIANTS_FAILED",
          details: { database: [updateVariantError.message] },
        }
      }
    }

    if (variantsToInsert.length > 0) {
      const { error: insertVariantsError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert)

      if (insertVariantsError) {
        logDatabaseError("Insert new variants", insertVariantsError)
        return {
          success: false,
          error:
            insertVariantsError.code === "23505"
              ? "VARIANT_SKU_ALREADY_EXISTS"
              : "UPDATE_VARIANTS_FAILED",
          details: { database: [insertVariantsError.message] },
        }
      }
    }

    if (incomingSkus.length > 0) {
      const { error: deleteVariantsError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", id)
        .not("sku", "in", formatPostgrestInList(incomingSkus))

      if (deleteVariantsError) {
        logDatabaseError("Delete removed variants", deleteVariantsError)
        return {
          success: false,
          error: "SYNC_VARIANTS_FAILED",
          details: { database: [deleteVariantsError.message] },
        }
      }
    }

    const { data: currentVariants, error: fetchVariantsError } = await supabase
      .from("product_variants")
      .select("id, sku")
      .eq("product_id", id)

    if (fetchVariantsError || !currentVariants) {
      logDatabaseError(
        "Fetch synced variants",
        fetchVariantsError ?? { message: "No variants returned after sync." }
      )
      return {
        success: false,
        error: "SYNC_VARIANTS_FAILED",
        details: fetchVariantsError?.message
          ? { database: [fetchVariantsError.message] }
          : undefined,
      }
    }

    const variantIdsBySku = new Map(
      currentVariants.map((variant) => [variant.sku, variant.id])
    )

    if (
      images.some(
        (img) =>
          img.variant_sku?.trim() &&
          !variantIdsBySku.has(img.variant_sku.trim())
      )
    ) {
      logDatabaseError("Resolve image variant", {
        message: "An image references a variant that does not exist.",
      })
      return { success: false, error: "IMAGE_VARIANT_NOT_FOUND" }
    }

    const { error: deleteImagesError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id)

    if (deleteImagesError) {
      logDatabaseError("Delete existing images", deleteImagesError)
      return {
        success: false,
        error: "SYNC_IMAGES_FAILED",
        details: { database: [deleteImagesError.message] },
      }
    }

    const imagesToInsert = normalizePrimaryImages(
      images.map((img, sort_order) => {
        const variantSku = img.variant_sku?.trim()
        return {
          url: img.url,
          alt_text: img.alt_text || null,
          is_primary: img.is_primary,
          sort_order,
          product_id: id,
          variant_id: variantSku ? variantIdsBySku.get(variantSku)! : null,
        }
      })
    )

    if (imagesToInsert.length > 0) {
      const { error: insertImagesError } = await supabase
        .from("product_images")
        .insert(imagesToInsert)

      if (insertImagesError) {
        logDatabaseError("Insert images", insertImagesError)
        return {
          success: false,
          error: "UPDATE_IMAGES_FAILED",
          details: { database: [insertImagesError.message] },
        }
      }
    }

    revalidateTag(CACHE_TAG.PRODUCTS, { expire: 0 })
    revalidatePath("/", "layout")

    console.info("[updateProduct] Product updated", {
      productId: id,
      variantCount: variants.length,
      imageCount: imagesToInsert.length,
    })

    return { success: true }
  } catch (error) {
    console.error("[updateProduct] Unexpected error:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}