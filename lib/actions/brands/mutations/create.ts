/**
 * @file lib/actions/brands/mutations/create.ts
 * @description Server Action to insert a new brand into the database.
 * Handles schema validation, parallel role/permission checks, uniqueness conflict resolution, and cache revalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand } from "../types"
import { brandSchema, createBrandSchema } from "../schemas"
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action
// ============================================================================

export async function createBrand(
  payload: unknown
): Promise<ApiResult<Brand | null>> {
  // 1. Validate payload using Zod schema
  const validation = createBrandSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const safeData = validation.data

  // 2. Perform parallel authorization checks using typed constants
  const [isAdmin, canCreate] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasPermission(PERMISSIONS.CREATE_BRAND),
  ])

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canCreate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Insert record into database
  const { data: newBrand, error } = await supabase
    .from("brands")
    .insert(safeData)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    return {
      success: false,
      error: "CREATE_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Schema verification on database output
  const parsedData = brandSchema.safeParse(newBrand)
  if (!parsedData.success) {
    console.error("Database schema mismatch on createBrand:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 6. Invalidate stale cache paths (المتجر واللوحة بالكامل)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: parsedData.data,
  }
}
