/**
 * @file lib/actions/staff-access/types.ts
 * @description أنواع بيانات إدارة وصول الموظفين.
 */

import type { Tables } from "@/lib/database/supabase/types"
import type { RoleRecord } from "@/lib/actions/role/types"

export type StaffAccessRole = RoleRecord

export type UserWithRoles = Pick<
  Tables<"profiles">,
  "id" | "first_name" | "last_name" | "email" | "avatar"
> & {
  roles: StaffAccessRole[]
}

export interface StaffAccessPageData {
  users: UserWithRoles[]
  roles: StaffAccessRole[]
  summary: {
    total: number
    assigned: number
    unassigned: number
  }
  isMobile: boolean
}
