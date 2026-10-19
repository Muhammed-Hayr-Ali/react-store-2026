/**
 * @file lib/actions/role/queries/get-roles.ts
 * @description Retrieves all system roles and their permissions.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission } from "../permission-checker"
import { PERMISSIONS, type RoleRecord } from "../types"

/**
 * تجلب جميع الأدوار مرتبة حسب تاريخ الإنشاء.
 */
export async function getRoles(): Promise<ApiResult<RoleRecord[]>> {
  const canViewRoles = await hasPermission(PERMISSIONS.VIEW_ROLES_MANAGEMENT)
  if (!canViewRoles) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("roles")
    .select("id, name, description, permissions, created_at")
    .order("created_at", { ascending: true })

  if (error) {
    return {
      success: false,
      error: "GET_ALL_ROLES_ERROR",
      details: { database: [error.message] },
    }
  }

  return {
    success: true,
    data: (data || []) as RoleRecord[],
  }
}
