/**
 * @file lib/actions/categories/mutations/create.ts
 * @description Server Action to insert a category enforcing the mandatory 6-step pattern.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { hasPermission } from "@/lib/actions/role/permission-checker"
import { PERMISSIONS } from "@/lib/actions/role/types"
import { categorySchema, createCategorySchema } from "../schemas"
import { ApiResult, Category } from "../types"

export async function createCategory(
  payload: unknown
): Promise<ApiResult<Category | null>> {
  // Step 1: Input Validation
  const validation = createCategorySchema.safeParse(payload)
  if (!validation.success) {
    const details: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!details[path]) details[path] = []
      details[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details }
  }

  const safeData = validation.data

  // Step 2: Permission Enforcement & Authentication
  const canCreate = await hasPermission(PERMISSIONS.CREATE_CATEGORY)
  if (!canCreate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // Step 3: Supabase Client Initialization
  const supabase = await createServerClient()

  // Step 4: Database Execution & Scoping
  const { data: newCategory, error } = await supabase
    .from("categories")
    .insert({
      name: safeData.name,
      name_ar: safeData.name_ar || null,
      slug: safeData.slug,
      description: safeData.description || null,
      parent_id: safeData.parent_id || null,
      image_url: safeData.image_url || null,
      image_alt: safeData.image_alt || null,
      is_active: safeData.is_active ?? true,
      sort_order: safeData.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "SLUG_ALREADY_EXISTS" }
    }
    if (error.code === "23503") {
      return { success: false, error: "PARENT_RECORD_NOT_FOUND" }
    }
    return {
      success: false,
      error: "CREATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  // Step 5: Runtime Entity Validation
  const parsedData = categorySchema.safeParse(newCategory)
  if (!parsedData.success) {
    console.error("Database schema mismatch on createCategory:", parsedData.error)
    return { success: false, error: "DATA_VALIDATION_ERROR" }
  }

  // Step 6: Cache Revalidation & Return Strategy
  revalidatePath(`/category/${parsedData.data.slug}`)
  revalidatePath("/dashboard/x9k2-panel/categories")
  revalidatePath("/", "layout")

  return { success: true, data: parsedData.data }
}