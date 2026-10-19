/**
 * @file lib/actions/products/mutations/delete.ts
 * @description Server Action to safely remove a product and clean up its relational entities.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "../../types/utils"
import { hasPermission, PERMISSIONS } from "../../role"

export async function deleteProduct(
  productId: string
): Promise<ApiResult<{ id: string }>> {
  const idValidation = z
    .string()
    .uuid("INVALID_PRODUCT_ID")
    .safeParse(productId)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_PRODUCT_ID",
    }
  }
  const validProductId = idValidation.data

  const canDelete = await hasPermission(PERMISSIONS.DELETE_PRODUCT)
  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  const supabase = await createServerClient()

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", validProductId)
    .single()

  if (fetchError || !product) {
    return {
      success: false,
      error: "PRODUCT_NOT_FOUND",
      details: { database: [fetchError?.message || "Product not found."] },
    }
  }

  await Promise.all([
    supabase.from("product_images").delete().eq("product_id", validProductId),
    supabase.from("product_variants").delete().eq("product_id", validProductId),
  ])

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", validProductId)

  if (deleteError) {
    return {
      success: false,
      error: "DELETE_PRODUCT_ERROR",
      details: { database: [deleteError.message] },
    }
  }

  revalidatePath(`/product/${product.slug}`)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: { id: validProductId },
  }
}