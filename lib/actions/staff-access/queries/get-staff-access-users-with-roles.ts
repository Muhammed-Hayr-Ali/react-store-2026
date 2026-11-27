/**
 * @file lib/actions/staff-access/queries/get-users-with-roles.ts
 * @description Retrieves users with their assigned roles.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { toRoleRecord } from "@/lib/actions/role/types"

import type { StaffAccessRole, UserWithRoles } from "../types"

/**
 * تجلب المستخدمين مع الأدوار المسندة إليهم لإدارة الوصول.
 */
export async function getStaffAccessUsersWithRoles(): Promise<
  ApiResult<UserWithRoles[]>
> {
  const supabase = await createServerClient()

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, avatar")
    .order("created_at", { ascending: false })

  if (profilesError) {
    return {
      success: false,
      error: "GET_PROFILES_ERROR",
      details: { database: [profilesError.message] },
    }
  }

  if (!profiles || profiles.length === 0) {
    return {
      success: true,
      data: [],
    }
  }

  const { data: userRolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select(
      `
      user_id,
      roles (
        id,
        name,
        description,
        permissions,
        created_at
      )
    `
    )

  if (rolesError) {
    return {
      success: false,
      error: "GET_USER_ROLES_ERROR",
      details: { database: [rolesError.message] },
    }
  }

  const rolesMap = new Map<string, StaffAccessRole[]>()

  for (const row of userRolesData ?? []) {
    if (!row.roles) continue

    const role = toRoleRecord(row.roles)
    if (!role) {
      return {
        success: false,
        error: "GET_USER_ROLES_ERROR",
        details: {
          database: [`Role "${row.roles.name}" has invalid permissions.`],
        },
      }
    }

    const current = rolesMap.get(row.user_id) ?? []
    current.push(role)
    rolesMap.set(row.user_id, current)
  }

  const formattedUsers: UserWithRoles[] = profiles.map((profile) => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    avatar: profile.avatar,
    roles: rolesMap.get(profile.id) ?? [],
  }))

  return {
    success: true,
    data: formattedUsers,
  }
}
