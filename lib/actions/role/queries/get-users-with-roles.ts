/**
 * @file lib/actions/role/queries/get-users-with-roles.ts
 * @description Retrieve users with their assigned roles from profiles and user_roles tables.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { AppPermission } from "../types"

// ============================================================================
// Types
// ============================================================================

export interface RoleDetail {
  id: number
  name: string
  description: string | null
  permissions: AppPermission[]
  created_at: string
}

export interface UserWithRoles {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  profile_image: string | null
  roles: RoleDetail[]
}

interface UserRoleRelationRow {
  roles: RoleDetail | null
}

interface ProfileWithRolesRow {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  profile_image: string | null
  user_roles: UserRoleRelationRow[] | null
}

// ============================================================================
// Query Function
// ============================================================================

export async function getUsersWithRoles(): Promise<ApiResult<UserWithRoles[]>> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      profile_image,
      user_roles (
        roles (
          id,
          name,
          description,
          permissions,
          created_at
        )
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "GET_USERS_WITH_ROLES_ERROR",
      details: { database: [error.message] },
    }
  }

  const rawProfiles = (data ?? []) as unknown as ProfileWithRolesRow[]

  const formattedUsers: UserWithRoles[] = rawProfiles.map((user) => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    profile_image: user.profile_image,
    roles: (user.user_roles ?? [])
      .map((relation) => relation.roles)
      .filter((role): role is RoleDetail => role !== null),
  }))

  return {
    success: true,
    data: formattedUsers,
  }
}
