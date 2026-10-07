/**
 * @file lib/actions/users/queries/get-admin-users.ts
 * @description Fetches the list of all users for the admin dashboard via Supabase RPC.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { AdminUserSummary, UserStatus } from "../types"

interface GetAdminUsersParams {
  search?: string
  status?: UserStatus
}

export async function getAdminUsersList(
  params?: GetAdminUsersParams
): Promise<ApiResult<AdminUserSummary[]>> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.rpc("get_admin_users_list", {
      p_search: params?.search?.trim() || null,
      p_status: params?.status || null,
    })

    if (error) {
      return {
        success: false,
        error: "GET_USERS_ERROR",
        details: { database: [error.message] },
      }
    }

    return {
      success: true,
      data: (data as AdminUserSummary[]) || [],
    }
  } catch (err) {
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
