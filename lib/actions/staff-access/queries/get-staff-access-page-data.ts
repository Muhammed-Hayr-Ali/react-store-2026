/*
 * @file lib/actions/staff-access/queries/get-staff-access-page-data.ts
 * @description Loads staff access data and calculates its summary.
 */

import { headers } from "next/headers"
import type { StaffAccessPageData } from "../types"
import { getUsersWithRoles } from "./get-users-with-roles"
import { getStaffAccessRoles } from "./get-staff-access-roles"

export async function getStaffAccessPageData(): Promise<{
  success: boolean
  data?: StaffAccessPageData
  error?: string
}> {
  const [usersResult, rolesResult] = await Promise.all([
    getUsersWithRoles(),
    getStaffAccessRoles(),
  ])

  if (!usersResult.success || !usersResult.data) {
    return {
      success: false,
      error:
        "error" in usersResult && typeof usersResult.error === "string"
          ? usersResult.error
          : "GET_USERS_ERROR",
    }
  }

  const users = usersResult.data
  const roles =
    rolesResult.success && rolesResult.data
      ? rolesResult.data
      : []

  // حساب الملخص برمجياً (فصل المنطق عن العرض)
  const total = users.length
  const assigned = users.filter((user) => {
    const assignedRoles = (user as { roles?: unknown[] }).roles
    return (
      assignedRoles && Array.isArray(assignedRoles) && assignedRoles.length > 0
    )
  }).length
  const unassigned = total - assigned

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  return {
    success: true,
    data: {
      users,
      roles,
      summary: { total, assigned, unassigned },
      isMobile,
    },
  }
}
