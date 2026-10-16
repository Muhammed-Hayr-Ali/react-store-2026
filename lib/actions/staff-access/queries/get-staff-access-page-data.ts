/*
 * @file lib/actions/staff-access/queries/get-staff-access-page-data.ts
 * @description Loads staff access data and calculates its summary.
 */

import { headers } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import type { StaffAccessPageData } from "../types"
import { getStaffAccessUsersWithRoles } from "./get-staff-access-users-with-roles"
import { getStaffAccessRoles } from "./get-staff-access-roles"

/**
 * تجهز المستخدمين والأدوار وملخص إسناد الأدوار لشاشة الوصول.
 */
export async function getStaffAccessPageData(): Promise<
  ApiResult<StaffAccessPageData>
> {
  const [usersResult, rolesResult] = await Promise.all([
    getStaffAccessUsersWithRoles(),
    getStaffAccessRoles(),
  ])

  if (!usersResult.success) {
    return {
      success: false,
      error: usersResult.error,
      details: usersResult.details,
    }
  }

  if (!rolesResult.success) {
    return {
      success: false,
      error: rolesResult.error,
      details: rolesResult.details,
    }
  }

  const users = usersResult.data
  const roles = rolesResult.data

  // حساب الملخص برمجياً (فصل المنطق عن العرض)
  const total = users.length
  const assigned = users.filter((user) => user.roles.length > 0).length
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
