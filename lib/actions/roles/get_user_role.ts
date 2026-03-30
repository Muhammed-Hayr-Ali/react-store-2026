import { createServerClient } from "@/lib/supabase/createServerClient"
import { ApiResult } from "@/lib/types/common"

export interface UserRoleResult {
  role_name: string
  is_active: boolean
}

interface UserRoleQueryResult {
  role_id: string
  is_active: boolean
  roles: {
    name: string
  }[]
}

export async function getUserRole(
  userId?: string
): Promise<ApiResult<UserRoleResult | UserRoleResult[]>> {
  // Create a new server client
  const supabase = await createServerClient()

  // Get the user (from session or provided userId)
  const {
    data: { user },
    error: authError,
  } = userId
    ? { data: { user: { id: userId } }, error: null }
    : await supabase.auth.getUser()

  // Check for authentication errors
  if (authError || !user) {
    return {
      success: false,
      error: "USER_NOT_AUTHENTICATED",
    }
  }

  // Query the user's roles from profile_roles joined with roles
  const { data: userRoles, error: rolesError } = await supabase
    .from("profile_roles")
    .select(
      `
      role_id,
      is_active,
      roles:role_id (
        name
      )
    `
    )
    .eq("user_id", user.id)

  // Handle query errors
  if (rolesError) {
    console.error("Error fetching user roles:", rolesError)
    return {
      success: false,
      error: "FAILED_TO_FETCH_ROLES",
    }
  }

  // Handle case where user has no roles
  if (!userRoles || userRoles.length === 0) {
    return {
      success: true,
      data: { role_name: "user", is_active: false },
    }
  }

  // Transform the response to include role name and active status
  const roleResults: UserRoleResult[] = userRoles.map(
    (item: UserRoleQueryResult) => ({
      role_name: item.roles[0]?.name ?? "user",
      is_active: item.is_active ?? false,
    })
  )

  // Return single role if only one, otherwise return array
  return {
    success: true,
    data: roleResults.length === 1 ? roleResults[0] : roleResults,
  }
}
