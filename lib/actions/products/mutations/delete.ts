/**
 * @file lib/actions/products/mutations/delete.ts
 * @description Server Action to safely remove a product and clean up its relational entities.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteProduct(
  productId: string
): Promise<ApiResult<{ id: string }>> {
  if (!productId || typeof productId !== "string") {
    return {
      success: false,
      error: "INVALID_PRODUCT_ID",
    }
  }

  // 1. Authorization check using typed constants
  const [isAdmin, canDelete] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasPermission(PERMISSIONS.DELETE_PRODUCT),
  ])

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  const supabase = await createServerClient()

  // 2. Fetch product slug for cache purging
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .single()

  if (fetchError || !product) {
    return {
      success: false,
      error: "PRODUCT_NOT_FOUND",
      details: { database: [fetchError?.message || "Product not found."] },
    }
  }

  // 3. Fallback cascade deletion for images and variants
  await Promise.all([
    supabase.from("product_images").delete().eq("product_id", productId),
    supabase.from("product_variants").delete().eq("product_id", productId),
  ])

  // 4. Delete root product
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)

  if (deleteError) {
    return {
      success: false,
      error: "DELETE_PRODUCT_ERROR",
      details: { database: [deleteError.message] },
    }
  }

  // 5. Invalidate caches
  revalidatePath(`/product/${product.slug}`)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: { id: productId },
  }
}
