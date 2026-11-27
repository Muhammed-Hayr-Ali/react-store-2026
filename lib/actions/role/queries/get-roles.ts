/**
 * @file lib/actions/role/queries/get-roles.ts
 * @description Retrieves all system roles and their permissions.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { toRoleRecord, type RoleRecord } from "../types"

/**
 * تجلب جميع الأدوار مرتبة حسب تاريخ الإنشاء.
 */
export async function getRoles(): Promise<ApiResult<RoleRecord[]>> {
 
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

  const roles: RoleRecord[] = []
  for (const row of data ?? []) {
    const role = toRoleRecord(row)
    if (!role) {
      return {
        success: false,
        error: "GET_ALL_ROLES_ERROR",
        details: { database: [`Role "${row.name}" has invalid permissions.`] },
      }
    }

    roles.push(role)
  }

  return { success: true, data: roles }
}
