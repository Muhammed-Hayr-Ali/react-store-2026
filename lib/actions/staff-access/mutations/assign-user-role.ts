/**
 * @file lib/actions/staff-access/mutations/assign-user-role.ts
 * @description Assigns a role to a user.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
 import { assignUserRoleSchema, type AssignUserRoleInput } from "../schemas"

export async function assignRoleToUser(
  input: AssignUserRoleInput
): Promise<ApiResult<null>> {
 

  const validation = assignUserRoleSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { userId, roleId } = validation.data
  const supabase = await createServerClient()

  const { data: existingAssignment } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role_id", roleId)
    .maybeSingle()

  if (existingAssignment) {
    return {
      success: false,
      error: "ROLE_ALREADY_ASSIGNED",
    }
  }

  const { error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role_id: roleId,
  })

  if (error) {
    return {
      success: false,
      error: "ASSIGN_ROLE_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
