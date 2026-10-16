/**
 * @file lib/actions/role/role-checker.ts
 * @description Checks whether the current user has a specified role.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"

import type { AppRole } from "./types"

/**
 * تتحقق مما إذا كان المستخدم الحالي يحمل الدور المحدد.
 */
export async function hasRole(roleName: AppRole): Promise<boolean> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("check_user_role", {
    p_role_name: roleName,
  })

  if (error) return false
  return Boolean(data)
}
