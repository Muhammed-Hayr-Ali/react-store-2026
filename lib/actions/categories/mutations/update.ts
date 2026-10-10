/**
 * @file lib/actions/categories/mutations/update.ts
 * @description Server Action to modify a category record with circular guard and 6-step compliance.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { categorySchema, updateCategorySchema } from "../schemas"
import { ApiResult, Category } from "../types"

export async function updateCategory(
  id: string,
  payload: unknown
): Promise<ApiResult<Category | null>> {
  // Step 1: Input Validation
  const idValidation = z.string().uuid("INVALID_CATEGORY_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: { id: ["INVALID_CATEGORY_ID"] },
    }
  }

  const validation = updateCategorySchema.safeParse(payload)
  if (!validation.success) {
    const details: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!details[path]) details[path] = []
      details[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details }
  }

  // Circular Reference Guard: A category cannot be its own parent
  if (validation.data.parent_id && validation.data.parent_id === id) {
    return {
      success: false,
      error: "CIRCULAR_PARENT_REFERENCE",
      details: { parent_id: ["CANNOT_BE_PARENT_OF_ITSELF"] },
    }
  }

  // Step 2: Permission Enforcement & Authentication
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_CATEGORY)
  if (!canUpdate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // Step 3: Supabase Client Initialization
  const supabase = await createServerClient()

  // Step 4: Database Execution & Scoping
  if (validation.data.slug) {
    const { data: existingSlug } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", validation.data.slug)
      .neq("id", id)
      .maybeSingle()

    if (existingSlug) {
      return { success: false, error: "SLUG_ALREADY_EXISTS" }
    }
  }

  const { data: updatedCategory, error } = await supabase
    .from("categories")
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "CATEGORY_NOT_FOUND" }
    }
    if (error.code === "23505") {
      return { success: false, error: "SLUG_ALREADY_EXISTS" }
    }
    if (error.code === "23503") {
      return { success: false, error: "PARENT_RECORD_NOT_FOUND" }
    }
    return {
      success: false,
      error: "UPDATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  // Step 5: Runtime Entity Validation
  const parsedData = categorySchema.safeParse(updatedCategory)
  if (!parsedData.success) {
    console.error("Database schema mismatch on updateCategory:", parsedData.error)
    return { success: false, error: "DATA_VALIDATION_ERROR" }
  }

  // Step 6: Cache Revalidation & Return Strategy
  revalidatePath(`/category/${parsedData.data.slug}`)
  revalidatePath("/dashboard/x9k2-panel/categories")
  revalidatePath("/", "layout")

  return { success: true, data: parsedData.data }
}