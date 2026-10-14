/**
 * @file lib/actions/users/mutations/create-user.ts
 * @description Server Action to create a new user via Supabase Admin API.
 */

"use server"

import { revalidatePath } from "next/cache"
import { getValidationDetails } from "../../validation"
import { createAdminClient } from "@/lib/database/supabase/admin"
import type { ApiResult } from "@/lib/actions/types/utils"
import type { AdminUserSummary } from "../types"
import { createUserSchema, type CreateUserFormValues } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

export async function createUser(
  input: CreateUserFormValues
): Promise<ApiResult<AdminUserSummary>> {
  const canCreate = await hasPermission(PERMISSIONS.CREATE_USER)
  if (!canCreate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = createUserSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const safeData = validation.data

  try {
    const supabase = createAdminClient()

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: safeData.email,
        password: safeData.password || Math.random().toString(36).slice(-8),
        email_confirm: true,
        user_metadata: {
          first_name: safeData.firstName,
          last_name: safeData.lastName,
        },
      })

    if (authError || !authData.user) {
      const errorMsg = authError?.message?.toLowerCase() || ""
      if (
        errorMsg.includes("already registered") ||
        errorMsg.includes("already exists") ||
        errorMsg.includes("email_exists")
      ) {
        return { success: false, error: "EMAIL_ALREADY_EXISTS" }
      }
      return {
        success: false,
        error: "CREATE_USER_ERROR",
        details: { database: [authError?.message || "Failed to create user"] },
      }
    }

    const userId = authData.user.id

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: safeData.email,
        first_name: safeData.firstName || null,
        last_name: safeData.lastName || null,
        phone_number: safeData.phoneNumber || null,
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Error saving user profile:", profileError.message)
    }

    const newUserSummary: AdminUserSummary = {
      id: userId,
      email: authData.user.email || safeData.email,
      first_name: safeData.firstName || null,
      last_name: safeData.lastName || null,
      phone_number: safeData.phoneNumber || null,
      profile_image: profileData?.profile_image || null,
      status: "active",
      ban_reason: null,
      banned_at: null,
      created_at: authData.user.created_at || new Date().toISOString(),
      roles: [],
    }

    revalidatePath("/", "layout")
    return { success: true, data: newUserSummary }
  } catch {
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
