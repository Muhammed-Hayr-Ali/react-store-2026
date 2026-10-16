/**
 * @file lib/actions/authentication/mutations/confirm-password-reset.ts
 * @description Verifies a reset token and updates the user's password.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createAdminClient } from "@/lib/database/supabase/admin"

import { getValidationDetails } from "../../validation"
import { confirmPasswordResetSchema } from "../schemas"

/**
 * تتحقق من رمز استعادة كلمة المرور وتحدث كلمة مرور المستخدم.
 */
export async function confirmPasswordReset(
  input: unknown
): Promise<ApiResult<null>> {
  const validation = confirmPasswordResetSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { token, password } = validation.data

  try {
    const supabaseAdmin = createAdminClient()

    const { data: userId, error: verifyError } = await supabaseAdmin.rpc(
      "verify_and_use_reset_token",
      { p_token: token }
    )

    if (verifyError || !userId) {
      return {
        success: false,
        error: "VERIFY_RESET_TOKEN_ERROR",
        details: verifyError ? { rpc: [verifyError.message] } : undefined,
      }
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
      })

    if (updateError) {
      return {
        success: false,
        error: "UPDATE_USER_PASSWORD_ERROR",
        details: { auth: [updateError.message] },
      }
    }

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: "CONFIRM_PASSWORD_RESET_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}
