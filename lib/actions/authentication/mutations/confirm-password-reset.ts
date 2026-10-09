/**
 * @file lib/actions/authentication/mutations/confirm-password-reset.ts
 * @description Verifies a reset token and updates the user's password.
 */

"use server"

import { createAdminClient } from "@/lib/database/supabase/admin"
import { confirmPasswordResetSchema } from "../schemas"
import { ApiResult } from "../types"

export async function confirmPasswordReset(
  payload: unknown
): Promise<ApiResult<null>> {
  // Step 1: Input Validation
  const validation = confirmPasswordResetSchema.safeParse(payload)
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
    // Step 2: Supabase Admin Client Initialization
    const supabaseAdmin = createAdminClient()

    // Step 3: Verify and consume reset token via RPC
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

    // Step 4: Update user credentials
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