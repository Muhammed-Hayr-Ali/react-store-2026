/**
 * @file lib/actions/users/queries/get-users-page-data.ts
 * @description Handles user data fetching, summary statistics calculation, and mobile detection.
 */

import { headers } from "next/headers"
import { getAdminUsersList } from "@/lib/actions/users"
// استيراد النوع الحقيقي مباشرة من ملف الأنواع أو المجلد الخاص به
import type { AdminUserSummary } from "@/lib/actions/users/types" // استبدل المسار بما يعادل ملف الأنواع لديك

export interface UsersPageData {
  users: AdminUserSummary[]
  summary: {
    total: number
    active: number
    banned: number
  }
  isMobile: boolean
}

export async function getUsersPageData(): Promise<{
  success: boolean
  data?: UsersPageData
  error?: string
}> {
  const result = await getAdminUsersList()

  if (!result.success || !result.data) {
    return {
      success: false,
      error:
        "error" in result && typeof result.error === "string"
          ? result.error
          : "GET_USERS_ERROR",
    }
  }

  const users = result.data as AdminUserSummary[]

  // حساب الملخص بشكل آمن
  const total = users.length
  const active = users.filter(
    (user) =>
      (user as { status?: string }).status === "active" ||
      (user as { account_status?: string }).account_status === "active"
  ).length
  const banned = users.filter((user) => {
    const status = (user as { status?: string }).status
    const accountStatus = (user as { account_status?: string }).account_status
    return (
      status === "banned" ||
      status === "suspended" ||
      accountStatus === "banned" ||
      accountStatus === "suspended"
    )
  }).length

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
