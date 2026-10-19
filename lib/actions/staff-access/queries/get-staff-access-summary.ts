/**
 * @file lib/actions/staff-access/queries/get-staff-access-summary.ts
 * @description Calculates aggregate summary for staff access management.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { getStaffAccessUsersWithRoles } from "./get-staff-access-users-with-roles"

export async function getStaffAccessSummary(): Promise<
  ApiResult<{ total: number; assigned: number; unassigned: number }>
> {
  const usersResult = await getStaffAccessUsersWithRoles()

  if (!usersResult.success) {
    return {
      success: false,
      error: usersResult.error,
      details: usersResult.details,
    }
  }

  const users = usersResult.data
  const total = users.length
  const assigned = users.filter((user) => user.roles.length > 0).length
  const unassigned = total - assigned

  return {
    success: true,
    data: { total, assigned, unassigned },
  }
}
