/**
 * @file lib/actions/authentication/mutations/confirm-password-reset.ts
 * @description Verifies a reset token and updates the user's password.
 */

"use server"

import { createAdminClient } from "@/lib/database/supabase/admin"
import { confirmPasswordResetSchema } from "../schemas"
import { ApiResult } from "@/lib/actions/types/utils"

export async function confirmPasswordReset(
  input: unknown
): Promise<ApiResult<null>> {
  const validation = confirmPasswordResetSchema.safeParse(input)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: fieldErrors,
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