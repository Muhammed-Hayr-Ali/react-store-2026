/**
 * @file lib/actions/role/queries/get-users-with-roles.ts
 * @description Retrieve users with their assigned roles from profiles and user_roles tables.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { RoleRecord } from "../mutations/create-role"

export interface UserWithRoles {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  profile_image: string | null
  roles: RoleRecord[]
}

interface UserRoleRow {
  user_id: string
  roles: RoleRecord | null
}

export async function getUsersWithRoles(): Promise<ApiResult<UserWithRoles[]>> {
  const supabase = await createServerClient()

  // 1. جلب الملفات الشخصية
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, profile_image")
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

  // 2. جلب علاقات الأدوار مع تفاصيل كل دور
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

  // 3. تجميع الأدوار بحسب user_id
  const rolesMap = new Map<string, RoleRecord[]>()
  const rawUserRoles = (userRolesData ?? []) as unknown as UserRoleRow[]

  for (const row of rawUserRoles) {
    if (!row.roles) continue
    const current = rolesMap.get(row.user_id) ?? []
    current.push(row.roles)
    rolesMap.set(row.user_id, current)
  }

  // 4. دمج الأدوار مع الحسابات الشخصية
  const formattedUsers: UserWithRoles[] = profiles.map((profile) => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    profile_image: profile.profile_image,
    roles: rolesMap.get(profile.id) ?? [],
  }))

  return {
    success: true,
    data: formattedUsers,
  }
}
