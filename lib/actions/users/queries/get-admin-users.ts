/**
 * @file lib/actions/users/queries/get-admin-users.ts
 * @description Retrieves users for the admin dashboard through Supabase RPC.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { getAdminUsersSchema, type GetAdminUsersInput } from "../schemas"
import { isUserStatus, type AdminUserSummary } from "../types"

/**
 * تجلب قائمة المستخدمين الإدارية مع مرشحات البحث والحالة.
 */
export async function getAdminUsers(
  input?: GetAdminUsersInput
): Promise<ApiResult<AdminUserSummary[]>> {
 
  const validation = getAdminUsersSchema.safeParse(input ?? {})
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.rpc("get_admin_users_list", {
      p_search: validation.data.search || undefined,
      p_status: validation.data.status || undefined,
    })

    if (error) {
      return {
        success: false,
        error: "GET_USERS_ERROR",
        details: { database: [error.message] },
      }
    }

    const users: AdminUserSummary[] = []
    for (const user of data ?? []) {
      if (!isUserStatus(user.status)) {
        return {
          success: false,
          error: "GET_USERS_ERROR",
          details: {
            database: [`Unexpected account status "${user.status}".`],
          },
        }
      }

      users.push({ ...user, status: user.status })
    }

    return { success: true, data: users }
  } catch (error) {
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}
