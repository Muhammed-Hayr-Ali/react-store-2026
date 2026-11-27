/**
 * @file lib/actions/staff-access/queries/get-staff-access-roles.ts
 * @description Retrieves roles available for staff access management.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

 import { toRoleRecord } from "@/lib/actions/role/types"
 import type { StaffAccessRole } from "../types"

/**
 * تجلب الأدوار المتاحة في شاشة إدارة وصول الموظفين.
 */
export async function getStaffAccessRoles(): Promise<
  ApiResult<StaffAccessRole[]>
> {
 
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

  const roles: StaffAccessRole[] = []
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
