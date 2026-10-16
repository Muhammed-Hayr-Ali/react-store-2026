/**
 * @file lib/actions/staff-access/queries/get-staff-access-roles.ts
 * @description Retrieves roles available for staff access management.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import type { StaffAccessRole } from "../types"

/**
 * تجلب الأدوار المتاحة في شاشة إدارة وصول الموظفين.
 */
export async function getStaffAccessRoles(): Promise<
  ApiResult<StaffAccessRole[]>
> {
  const canViewStaffAccess = await hasPermission(PERMISSIONS.VIEW_STAFF_ACCESS)
  if (!canViewStaffAccess) {
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
    data: (data || []) as StaffAccessRole[],
  }
}
