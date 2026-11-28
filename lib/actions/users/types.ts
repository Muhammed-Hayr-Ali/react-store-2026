/**
 * @file lib/actions/users/types.ts
 * @description Type definitions for user management.
 */

import type { Database } from "@/lib/database/supabase/database.types"

export type UserStatus = "active" | "suspended" | "banned"

type RawFunctionReturns =
  Database["public"]["Functions"] extends Record<
    "get_admin_users_list",
    { Returns: infer R }
  >
    ? R
    : never

type AdminUserRow = RawFunctionReturns extends readonly (infer T)[]
  ? T
  : RawFunctionReturns extends (infer T)[]
    ? T
    : {
        id: string
        created_at: string
        roles?: string[] | null
      }

export type AdminUserSummary = Omit<
  AdminUserRow,
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "avatar"
  | "status"
  | "ban_reason"
  | "banned_at"
> & {
  id: string
  created_at: string
  roles?: string[] | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  status: UserStatus
  ban_reason: string | null
  banned_at: string | null
}

export function isUserStatus(value: string): value is UserStatus {
  return value === "active" || value === "suspended" || value === "banned"
}
