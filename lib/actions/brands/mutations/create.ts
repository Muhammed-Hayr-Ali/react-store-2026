"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand, createBrandSchema, brandSchema } from "../types"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

export async function createBrand(
  payload: unknown
): Promise<ApiResult<Brand | null>> {
  // 1. Validate payload using schema
  const validation = createBrandSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: z.flattenError(validation.error).fieldErrors,
    }
  }

  const safeData = validation.data

  // 2. Check authorization in parallel
  const [isAdmin, canCreate] = await Promise.all([
    hasRole("admin"),
    hasPermission("create_brand"),
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

  // 4. Insert brand into database
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

  // 5. Schema verification on returned data
  const parsedData = brandSchema.safeParse(newBrand)
  if (!parsedData.success) {
    console.error("Database data mismatch on create:", parsedData.error)
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
