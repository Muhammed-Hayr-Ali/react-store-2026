/**
 * @file lib/actions/users/queries/get-users-page-data.ts
 * @description Handles user data fetching, summary statistics calculation, and mobile detection.
 */

import { headers } from "next/headers"
import type { ApiResult } from "@/lib/actions/types/utils"
import { getAdminUsers } from "./get-admin-users"
import type { AdminUserSummary } from "../types"

export interface UsersPageData {
  users: AdminUserSummary[]
  summary: {
    total: number
    active: number
    banned: number
  }
  isMobile: boolean
}

export async function getUsersPageData(): Promise<ApiResult<UsersPageData>> {
  const result = await getAdminUsers()

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      details: result.details,
    }
  }

  const users = result.data

  // حساب الملخص بشكل آمن
  const total = users.length
  const active = users.filter((user) => user.status === "active").length
  const banned = users.filter((user) => user.status !== "active").length

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
      summary: { total, active, banned },
      isMobile,
    },
  }
}
