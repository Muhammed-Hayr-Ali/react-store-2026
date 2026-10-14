/**
 * @file lib/actions/users/queries/get-admin-users.ts
 * @description Retrieves users for the admin dashboard through Supabase RPC.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import type { AdminUserSummary, UserStatus } from "../types"

interface GetAdminUsersInput {
  search?: string
  status?: UserStatus
}

export async function getAdminUsersList(
  input?: GetAdminUsersInput
): Promise<ApiResult<AdminUserSummary[]>> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.rpc("get_admin_users_list", {
      p_search: input?.search?.trim() || null,
      p_status: input?.status || null,
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
  } catch {
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
