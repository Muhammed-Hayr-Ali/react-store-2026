/**
 * @file lib/actions/users/mutations/create-user.ts
 * @description Server Action to create a new user via Supabase Admin API.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { ApiResult } from "@/lib/database/types/utils"
import { AdminUserSummary } from "../types"
import { createUserSchema, CreateUserFormValues } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

export async function createUser(
  payload: CreateUserFormValues
): Promise<ApiResult<AdminUserSummary | null>> {
  // 1. Permission check
  const canCreate = await hasPermission(PERMISSIONS.CREATE_USER)
  if (!canCreate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // 2. Validate input schema
  const validation = createUserSchema.safeParse(payload)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details: fieldErrors }
  }

  const safeData = validation.data

  try {
    const supabase = createAdminClient()

    // 3. Create user via Admin API
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

    // 4. Save profile to profiles table
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
  } catch (err) {
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
