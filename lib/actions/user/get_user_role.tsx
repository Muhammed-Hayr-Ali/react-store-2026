"use server"

import { createServerClient } from "@/lib/supabase/createServerClient"
import { revalidateTag } from "next/cache"

export interface UserRole {
  id: string
  name: "admin" | "vendor" | "delivery" | "customer"
  description: string | null
  permissions: string[]
  is_active: boolean
  granted_at: string
}

export type GetUserRoleResult = 
  | { success: true;  role: UserRole | null }
  | { success: false; error: string; code?: string }

export async function getUserRole() {
  const supabase = await createServerClient()

  // ─────────────────────────────────────────────────────
  // 1. Get the authenticated user
  // ─────────────────────────────────────────────────────
  const {  data , error: userError } = await supabase.auth.getUser()

  if (userError || !data || !data.user.id) {
    console.error("[getUserRole] Auth error:", userError)
    return {
      success: false,
      error: "USER_NOT_AUTHENTICATED",
      code: "AUTH_ERROR",
    }
  }

  try {
    // ─────────────────────────────────────────────────────
    // 2. Query profile_roles joined with roles
    //    - Get ONLY active roles for current user
    //    - Parse JSONB permissions array
    // ─────────────────────────────────────────────────────
    const { data: roleData, error: queryError } = await supabase
      .from("profile_roles")
      .select(
        `
        is_active,
        granted_at,
        roles (
          id,
          name,
          description,
          permissions
        )
      `
      )
      .eq("user_id", data.user.id)
      .eq("is_active", true)
      .maybeSingle()  // Returns null if no row found (not an error)

    if (queryError) {
      console.error("[getUserRole] Query error:", queryError)
      return {
        success: false,
        error: "Failed to fetch user role",
        code: queryError.code || "QUERY_ERROR"
      }
    }

    // ─────────────────────────────────────────────────────
    // 3. Transform response to UserRole interface
    // ─────────────────────────────────────────────────────
    if (!roleData || !roleData.roles) {
      // User exists but has no active role assigned yet
      return { success: true,  role: null }
    }

    

    return { success: true,  role: roleData.roles }

  } catch (err) {
    console.error("[getUserRole] Unexpected error:", err)
    return {
      success: false,
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR"
    }
  }
}
