"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Role } from "./types"

export async function readRolesAndPermissionsById({
  userId,
}: {
  userId: string | null
}): Promise<ApiResult<Role>> {
  // منع إرسال قيمة فارغة أو null لتجنب خطأ UUID
  if (!userId) {
    return { success: false, error: "MISSING_USER_ID" }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase.rpc(
    "read_roles_and_permissions_by_id",
    {
      p_user_id: userId,
    }
  )

  if (error) {
    return {
      success: false,
      error: "READ_ROLES_AND_PERMISSIONS_FAILED",
      details: {
        error: [error.message],
      },
    }
  }

  return {
    success: true,
    data,
  }
}
