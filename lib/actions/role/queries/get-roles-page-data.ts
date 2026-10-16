/**
 * @file lib/actions/role/queries/get-roles-page-data.ts
 * @description Handles roles fetching, summary calculations, and mobile detection with strict type safety.
 */

import { headers } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import { getAllRoles } from "./get-all-roles"
import type { RoleRecord } from "../types"

export interface RolesPageData {
  roles: RoleRecord[]
  summary: {
    total: number
    active: number
    empty: number
  }
  isMobile: boolean
}

/**
 * تجهز الأدوار وملخص الصلاحيات ومؤشر عرض الهاتف.
 */
export async function getRolesPageData(): Promise<ApiResult<RolesPageData>> {
  const result = await getAllRoles()

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      details: result.details,
    }
  }

  const roles = result.data

  // حساب الملخص برمجياً (فصل المنطق عن العرض) مع فحص آمن للخصائص
  const total = roles.length
  const active = roles.filter((role) => role.permissions.length > 0).length
  const empty = total - active

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  return {
    success: true,
    data: {
      roles,
      summary: { total, active, empty },
      isMobile,
    },
  }
}
