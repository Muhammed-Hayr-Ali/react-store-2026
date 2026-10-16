/**
 * @file lib/actions/users/queries/get-admin-users.ts
 * @description Retrieves users for the admin dashboard through Supabase RPC.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { getAdminUsersSchema, type GetAdminUsersInput } from "../schemas"
import type { AdminUserSummary } from "../types"

/**
 * تجلب قائمة المستخدمين الإدارية مع مرشحات البحث والحالة.
 */
export async function getAdminUsers(
  input?: GetAdminUsersInput
): Promise<ApiResult<AdminUserSummary[]>> {
  const canViewUsers = await hasPermission(PERMISSIONS.VIEW_USERS_MANAGEMENT)
  if (!canViewUsers) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

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
      p_search: validation.data.search || null,
      p_status: validation.data.status || null,
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
