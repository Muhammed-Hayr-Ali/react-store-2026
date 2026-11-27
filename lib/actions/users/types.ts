/**
 * @file lib/actions/users/types.ts
 * @description Type definitions for user management.
 */

export type UserStatus = "active" | "suspended" | "banned"

import type { DbFunctionReturns } from "@/lib/database/supabase/types"

type AdminUserRow = DbFunctionReturns<"get_admin_users_list">[number]

export type AdminUserSummary = Omit<
  AdminUserRow,
  | "first_name"
  | "last_name"
  | "email"
  | "phone_number"
  | "profile_image"
  | "status"
  | "ban_reason"
  | "banned_at"
> & {
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string | null
  profile_image: string | null
  status: UserStatus
  ban_reason: string | null
  banned_at: string | null
}

export function isUserStatus(value: string): value is UserStatus {
  return value === "active" || value === "suspended" || value === "banned"
}
