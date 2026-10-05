"use server"

import { createClient } from "@/lib/database/supabase/server"
import { AdminUserSummary, GetAdminUsersResult, UserStatus } from "../types"

interface GetAdminUsersParams {
  search?: string
  status?: UserStatus
}

export async function getAdminUsersList(
  params?: GetAdminUsersParams
): Promise<GetAdminUsersResult> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_admin_users_list", {
      p_search: params?.search?.trim() || null,
      p_status: params?.status || null,
    })

    if (error) {
      console.error("Error fetching admin users:", error.message)
      return { success: false, error: error.message, data: [] }
    }

    return {
      success: true,
      data: (data as AdminUserSummary[]) || [],
    }
  } catch (err) {
    console.error("Unexpected error in getAdminUsersList:", err)
    return {
      success: false,
      error: "An unexpected error occurred while fetching users.",
      data: [],
    }
  }
}
