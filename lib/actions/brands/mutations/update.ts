"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand, brandSchema, updateBrandSchema } from "../types"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

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

  // 2. Validate payload
  const validation = updateBrandSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const safeData = validation.data

  // 3. Check authorization in parallel
  const [isAdmin, canUpdate] = await Promise.all([
    hasRole("admin"),
    hasPermission("update_brand"),
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

  // 5. Update database record
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

  // 6. Schema verification on returned data
  const parsedData = brandSchema.safeParse(updatedBrand)
  if (!parsedData.success) {
    console.error("Database data mismatch on update:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  return {
    success: true,
    data: parsedData.data,
  }
}
