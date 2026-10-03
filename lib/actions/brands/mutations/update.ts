/**
 * @file lib/actions/brands/mutations/update.ts
 * @description Server Action to update an existing brand by UUID.
 * Enforces parameter validation, partial schema parsing, authorization, and route cache revalidation.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand } from "../types"
import { brandSchema, updateBrandSchema } from "../schemas"
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action
// ============================================================================

export async function updateBrand(
  id: string,
  payload: unknown
): Promise<ApiResult<Brand | null>> {
  // 1. Validate ID format
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. Validate update payload
  const validation = updateBrandSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const safeData = validation.data

  // 3. Perform parallel authorization checks using typed constants
  const [isAdmin, canUpdate] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasPermission(PERMISSIONS.UPDATE_BRAND),
  ])

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canUpdate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 4. Initialize Supabase client
  const supabase = await createServerClient()

  // 5. Update record in database
  const { data: updatedBrand, error } = await supabase
    .from("brands")
    .update(safeData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "BRAND_NOT_FOUND",
      }
    }

    return {
      success: false,
      error: "UPDATE_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  // 6. Schema verification on database output
  const parsedData = brandSchema.safeParse(updatedBrand)
  if (!parsedData.success) {
    console.error("Database schema mismatch on updateBrand:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 7. Invalidate related cache paths
  revalidatePath(`/brand/${parsedData.data.slug}`)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: parsedData.data,
  }
}
