"use server"

/**
 * @file lib/actions/products/create.ts
 * @description Server action for creating a new product with its variants and images.
 * Ensures atomicity (All-or-Nothing) using cascading rollbacks if any step fails.
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { createProductSchema, type CreateProductInput } from "../schemas"
import { revalidatePath, revalidateTag } from "next/cache"
import { CACHE_TAG } from "@/lib/config/app_config"
import { normalizePrimaryImages } from "../normalize-primary-images"

export type CreateProductResult =
  { success: true } | { success: false; error: string }

export async function createProduct(
  input: CreateProductInput
): Promise<CreateProductResult> {
  try {
    const validation = createProductSchema.safeParse(input)
    if (!validation.success) {
      if (
        validation.error.issues.some(
          (issue) => issue.message === "DUPLICATE_VARIANT_SKU"
        )
      ) {
        return { success: false, error: "DUPLICATE_VARIANT_SKU" }
      }

      return { success: false, error: "VALIDATION_ERROR" }
    }

    const { variants, images, ...productData } = validation.data
    const supabase = await createServerClient()

    const { count: slugCount, error: slugError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("slug", productData.slug)

    if (slugError) {
      return { success: false, error: "DATABASE_ERROR" }
    }

    if (slugCount && slugCount > 0) {
      return { success: false, error: "PRODUCT_SLUG_ALREADY_EXISTS" }
    }

    const submittedSkus = variants.map(({ sku }) => sku)
    const { data: existingVariants, error: skuCheckError } = await supabase
      .from("product_variants")
      .select("sku")
      .in("sku", submittedSkus)

    if (skuCheckError) {
      console.error("[createProduct] Failed to check variant SKUs", {
        skus: submittedSkus,
        error: skuCheckError,
      })
      return { success: false, error: "DATABASE_ERROR" }
    }

    if (existingVariants?.length) {
      return { success: false, error: "VARIANT_SKU_ALREADY_EXISTS" }
    }

    const { data: newProduct, error: productInsertError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single()

    if (productInsertError || !newProduct) {
      return { success: false, error: "CREATE_PRODUCT_FAILED" }
    }

    const variantsToInsert = variants.map((variant) => ({
      ...variant,
      product_id: newProduct.id,
      expiration_date: variant.expiration_date || null,
    }))

    const { data: insertedVariants, error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantsToInsert)
      .select("id, sku")

    if (
      variantsError ||
      !insertedVariants ||
      insertedVariants.length !== variantsToInsert.length
    ) {
      console.error("[createProduct] Failed to insert product variants", {
        productId: newProduct.id,
        variantCount: variantsToInsert.length,
        skus: variantsToInsert.map(({ sku }) => sku),
        error: variantsError ?? "Variant rows were not returned after insert.",
      })
      await supabase.from("products").delete().eq("id", newProduct.id)
      return {
        success: false,
        error:
          variantsError?.code === "23505"
            ? "VARIANT_SKU_ALREADY_EXISTS"
            : "CREATE_VARIANTS_FAILED",
      }
    }

    const variantIdsBySku = new Map(
      insertedVariants.map((variant) => [variant.sku, variant.id])
    )
    const imagesToInsert = normalizePrimaryImages(
      images.map((img) => {
        const variantSku = img.variant_sku?.trim()
        return {
          url: img.url,
          alt_text: img.alt_text || null,
          is_primary: img.is_primary,
          product_id: newProduct.id,
          variant_id: variantSku ? variantIdsBySku.get(variantSku)! : null,
        }
      })
    )

    if (
      images.some(
        (img) =>
          img.variant_sku?.trim() &&
          !variantIdsBySku.has(img.variant_sku.trim())
      )
    ) {
      console.error("[createProduct] Image references an uninserted variant", {
        productId: newProduct.id,
      })
      await supabase.from("products").delete().eq("id", newProduct.id)
      return { success: false, error: "IMAGE_VARIANT_NOT_FOUND" }
    }

    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imagesToInsert)

    if (imagesError) {
      console.error("[createProduct] Failed to insert product images", {
        productId: newProduct.id,
        imageCount: imagesToInsert.length,
        error: imagesError,
      })
      await supabase.from("products").delete().eq("id", newProduct.id)
      return { success: false, error: "CREATE_IMAGES_FAILED" }
    }

    revalidateTag(CACHE_TAG.PRODUCTS, { expire: 0 })
    revalidatePath("/", "layout")

    return { success: true }
  } catch (error) {
    console.error("[createProduct] Unexpected error:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
