/**
 * @file lib/actions/users/types.ts
 * @description Type definitions for user management.
 */

export type UserStatus = "active" | "suspended" | "banned"

export interface AdminUserSummary {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string | null
  profile_image: string | null
  status: UserStatus
  ban_reason: string | null
  banned_at: string | null
  created_at: string
  roles: string[]
}
