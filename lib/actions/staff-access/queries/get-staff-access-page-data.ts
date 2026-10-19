/**
 * @file lib/actions/staff-access/queries/get-staff-access-page-data.ts
 * @description Loads staff access data and calculates its summary.
 */

import { headers } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import type { StaffAccessPageData } from "../types"
import { getStaffAccessUsersWithRoles } from "./get-staff-access-users-with-roles"
import { getStaffAccessRoles } from "./get-staff-access-roles"
import { getStaffAccessSummary } from "./get-staff-access-summary"

export async function getStaffAccessPageData(): Promise<
  ApiResult<StaffAccessPageData>
> {
  const [usersResult, rolesResult, summaryResult] = await Promise.all([
    getStaffAccessUsersWithRoles(),
    getStaffAccessRoles(),
    getStaffAccessSummary(),
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

  if (!summaryResult.success) {
    return {
      success: false,
      error: summaryResult.error,
      details: summaryResult.details,
    }
  }

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  return {
    success: true,
    data: {
      users: usersResult.data,
      roles: rolesResult.data,
      summary: summaryResult.data,
      isMobile,
    },
  }
}
