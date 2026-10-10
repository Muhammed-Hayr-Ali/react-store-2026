/**
 * @file lib/actions/categories/mutations/delete.ts
 * @description Server Action to permanently remove a category with relational product integrity.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { ApiResult } from "../types"

export async function deleteCategory(
  id: string
): Promise<ApiResult<{ id: string } | null>> {
  // Step 1: Input Validation
  const idValidation = z.string().uuid("INVALID_CATEGORY_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: { id: ["INVALID_CATEGORY_ID"] },
    }
  }

  // Step 2: Permission Enforcement & Authentication
  const canDelete = await hasPermission(PERMISSIONS.DELETE_CATEGORY)
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // Step 3: Supabase Client Initialization
  const supabase = await createServerClient()

  // Step 4: Database Execution & Relational Guard
  const { count: productsCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)

  if (productsCount && productsCount > 0) {
    return {
      success: false,
      error: "CATEGORY_HAS_PRODUCTS",
      details: { products: [`Cannot delete category with ${productsCount} attached products`] },
    }
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "CATEGORY_NOT_FOUND" }
    }
    return {
      success: false,
      error: "DELETE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  // Step 5: Runtime Entity Validation
  const result = { id }

  // Step 6: Cache Revalidation & Return Strategy
  revalidatePath("/dashboard/x9k2-panel/categories")
  revalidatePath("/", "layout")

  return { success: true, data: result }
}