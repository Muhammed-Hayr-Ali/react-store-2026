/**
 * @file lib/actions/products/mutations/delete.ts
 * @description Server Action to safely remove a product and clean up its relational entities.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteProduct(
  productId: string
): Promise<ApiResult<{ id: string }>> {
  // 1. Validate Product ID
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

  // 2. Permission check
  const canDelete = await hasPermission(PERMISSIONS.DELETE_PRODUCT)
  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  const supabase = await createServerClient()

  // 3. Fetch product slug for cache purging
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

  // 4. Fallback cascade deletion for images and variants
  await Promise.all([
    supabase.from("product_images").delete().eq("product_id", validProductId),
    supabase.from("product_variants").delete().eq("product_id", validProductId),
  ])

  // 5. Delete root product
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

  // 6. Invalidate caches
  revalidatePath(`/product/${product.slug}`)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: { id: validProductId },
  }
}
