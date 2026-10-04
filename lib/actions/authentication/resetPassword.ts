"use server"

import React from "react"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { ApiResult } from "@/lib/database/types/utils"
import { sendEmail } from "@/lib/services/email/send-email"
import ResetPasswordEmail from "@/lib/services/email/templates/reset-password-email"
import { appRoutes } from "@/lib/config/app-routes"
import {
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
} from "./schemas"
import { RequestPasswordResetInput, ConfirmPasswordResetInput } from "./types"

export async function requestPasswordReset(
  input: RequestPasswordResetInput
): Promise<ApiResult<null>> {
  const validation = requestPasswordResetSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { email } = validation.data

  try {
    const supabaseAdmin = createAdminClient()
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, email")
      .eq("email", email)
      .single()

    // حماية ضد كشف الحسابات (Prevent Email Enumeration)
    if (profileError) {
      if (profileError.code === "PGRST116") {
        return { success: true, data: null }
      }
      return { success: false, error: "DATABASE_READ_ERROR" }
    }

    if (!profile) {
      return { success: true, data: null }
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    const { error: dbError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        token: token,
        expires_at: expiresAt.toISOString(),
      })

    if (dbError) {
      return { success: false, error: "TOKEN_INSERT_FAILED" }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}${appRoutes.auth.resetPassword}?token=${token}`

    await sendEmail({
      to: email,
      subject: "Password Reset Request - Marketna",
      reactComponent: React.createElement(ResetPasswordEmail, {
        firstName: profile.first_name,
        resetUrl: resetUrl,
      }),
    })

    return { success: true, data: null }
  } catch (error) {
    console.error("Error in requestPasswordReset:", error)
    return { success: false, error: "FAILED_TO_SEND_RESET_EMAIL" }
  }
}

export async function confirmPasswordReset(
  input: ConfirmPasswordResetInput
): Promise<ApiResult<null>> {
  const validation = confirmPasswordResetSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
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
      return { success: false, error: "INVALID_OR_EXPIRED_TOKEN" }
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
      })

    if (updateError) {
      console.error("Error updating password:", updateError)
      return { success: false, error: "FAILED_TO_UPDATE_PASSWORD" }
    }

    return { success: true, data: null }
  } catch (error) {
    console.error("Error in confirmPasswordReset:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
