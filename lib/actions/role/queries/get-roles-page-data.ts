/**
 * @file lib/actions/roles/queries/get-roles-page-data.ts
 * @description Handles roles fetching, summary calculations, and mobile detection with strict type safety.
 */

import { headers } from "next/headers"
import { getAllRoles } from "./get-all-roles"

// استنباط نوع الدور بدقة من مخرجات الدالة لضمان تجنب أي استخدام لـ any
type RoleItem = Awaited<ReturnType<typeof getAllRoles>> extends {
  success: true
  data: infer T
}
  ? T extends (infer U)[]
    ? U
    : never
  : never

export interface RolesPageData {
  roles: RoleItem[]
  summary: {
    total: number
    active: number
    empty: number
  }
  isMobile: boolean
}

export async function getRolesPageData(): Promise<{
  success: boolean
  data?: RolesPageData
  error?: string
}> {
  const result = await getAllRoles()

  if (!result || !result.success || !result.data) {
    return {
      success: false,
      error: "error" in result && typeof result.error === "string" ? result.error : "GET_ALL_ROLES_ERROR",
    }
  }

  const roles = result.data as RoleItem[]

  // حساب الملخص برمجياً (فصل المنطق عن العرض) مع فحص آمن للخصائص
  const total = roles.length
  const active = roles.filter((role) => {
    const permissions = (role as { permissions?: Record<string, unknown> }).permissions
    return permissions && Object.keys(permissions).length > 0
  }).length
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