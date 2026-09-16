"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category, createCategorySchema, categorySchema } from "./types"
import { hasRole } from "../role/role-checker"
import { hasPermission } from "../role/permission-checker"

export async function createCategory(
  payload: unknown
): Promise<ApiResult<Category | null>> {


  // validation payload data
  const validation = createCategorySchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: z.flattenError(validation.error).fieldErrors,
    }
  }

  //  create safe data
  const safeData = validation.data


  // check if user has admin role
  const has_role = await hasRole("admin")
  if (!has_role) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // check if user has create_category permission
  const has_permission = await hasPermission("create_category")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }



  // initialize Supabase client
  const supabase = await createServerClient()
  
  // insert data into database
  const { data, error } = await supabase
    .from("categories")
    .insert(safeData)
    .select()
    .single()

  // handle errors
  if (error) {
    // check for unique constraint violation
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    // log error
    return {
      success: false,
      error: "CREATE_CATEGORY_ERROR",
      details: {
        error: [error.message],
      },
    }
  }

  //  check if data is valid
  const parsedData = categorySchema.safeParse(data)
  if (!parsedData.success) {
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // success
  return {
    success: true,
    data: parsedData.data,
  }
}
