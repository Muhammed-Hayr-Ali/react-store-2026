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
  // check if id is valid
  const idValidation = z.uuid({ error: "invalid_id_format" }).safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // check if payload is valid
  const validation = updateBrandSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: z.flattenError(validation.error).fieldErrors,
    }
  }

  //  create safe data
  const safeData = validation.data

  // initialize Supabase client
  const supabase = await createServerClient()

  // check if user has admin role
  const has_role = await hasRole("admin")
  if (!has_role) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // check if user has permission
  const has_permission = await hasPermission("update_brand")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // update category
  const { data: updatedBrand, error } = await supabase
    .from("brands")
    .update(safeData)
    .eq("id", id)
    .select()
    .single()

  // handle any unexpected errors
  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    //check if brand not found
    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "BRAND_NOT_FOUND",
      }
    }

    // handle any other unexpected errors
    return {
      success: false,
      error: "UPDATE_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  // handle database data mismatch
  const parsedData = brandSchema.safeParse(updatedBrand)
  if (!parsedData.success) {
    console.error("Database data mismatch on update:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  //success
  return {
    success: true,
    data: parsedData.data,
  }
}
