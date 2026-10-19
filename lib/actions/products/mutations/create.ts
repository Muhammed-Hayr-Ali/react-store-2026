"use server"

/**
 * @file lib/actions/products/create.ts
 * @description Server action for creating a new product with its variants and images.
 * Ensures atomicity (All-or-Nothing) using cascading rollbacks if any step fails.
 */

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { createProductSchema, type CreateProductInput } from "../schemas"

export type CreateProductResult =
  | { success: true }
  | { success: false; error: string }

export async function createProduct(
  input: CreateProductInput
): Promise<CreateProductResult> {
  try {
    const canCreate = await hasPermission(PERMISSIONS.CREATE_PRODUCT)
    if (!canCreate) {
      return { success: false, error: "PERMISSION_DENIED" }
    }

    const validation = createProductSchema.safeParse(input)
    if (!validation.success) {
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

    const { error: variantsError } = await supabase
      .from("product_variants")
      .insert(variantsToInsert)

    if (variantsError) {
      console.error("[createProduct] Failed to insert product variants", {
        productId: newProduct.id,
        variantCount: variantsToInsert.length,
        skus: variantsToInsert.map(({ sku }) => sku),
        error: variantsError,
      })
      await supabase.from("products").delete().eq("id", newProduct.id)
      return { success: false, error: "CREATE_VARIANTS_FAILED" }
    }

    const imagesToInsert = images.map((img) => ({
      ...img,
      product_id: newProduct.id,
    }))

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

    revalidatePath("/dashboard/products")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("[createProduct] Unexpected error:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}

