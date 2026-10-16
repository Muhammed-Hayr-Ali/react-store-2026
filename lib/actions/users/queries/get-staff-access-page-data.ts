/*
 * @file lib/actions/staff_access/queries/get-staff-access-page-data.ts
 * @description Handles staff access data fetching, summary calculations, and mobile detection with strict type safety.
 */

import { headers } from "next/headers"
import { getUsersWithRoles } from "@/lib/actions/role/queries/get-users-with-roles"
import { getAllRoles } from "@/lib/actions/role/queries/get-all-roles"

type UserItem =
  Awaited<ReturnType<typeof getUsersWithRoles>> extends {
    success: true
    data: infer T
  }
    ? T extends (infer U)[]
      ? U
      : never
    : never

type RoleItem =
  Awaited<ReturnType<typeof getAllRoles>> extends {
    success: true
    data: infer T
  }
    ? T extends (infer U)[]
      ? U
      : never
    : never

export interface StaffAccessPageData {
  users: UserItem[]
  roles: RoleItem[]
  summary: {
    total: number
    assigned: number
    unassigned: number
  }
  isMobile: boolean
}

export async function getStaffAccessPageData(): Promise<{
  success: boolean
  data?: StaffAccessPageData
  error?: string
}> {
  const [usersResult, rolesResult] = await Promise.all([
    getUsersWithRoles(),
    getAllRoles(),
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

  const users = usersResult.data as UserItem[]
  const roles =
    rolesResult.success && rolesResult.data
      ? (rolesResult.data as RoleItem[])
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
