/**
 * @file lib/actions/authentication/mutations/request-password-reset.ts
 * @description Initiates a password reset request and delivers a secure reset token via email.
 */

"use server"

import React from "react"

import type { ApiResult } from "@/lib/actions/types/utils"
import { appRoutes } from "@/lib/config/app-routes"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { sendEmail } from "@/lib/services/email/send-email"
import { resolveEmailLocale } from "@/lib/services/email/locale"
import ResetPasswordEmail from "@/lib/services/email/templates/reset-password-email"

import { getValidationDetails } from "../../validation"
import { requestPasswordResetSchema } from "../schemas"

/**
 * تنشئ رمز استعادة كلمة المرور وترسل رابط الاستعادة بالبريد.
 */
export async function requestPasswordReset(
  input: unknown
): Promise<ApiResult<null>> {
  const validation = requestPasswordResetSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
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

    // Timing Attack Mitigation: Return success even if email is not found
    if (profileError || !profile) {
      return { success: true, data: null }
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const { error: dbError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        token: token,
        expires_at: expiresAt.toISOString(),
      })

    if (dbError) {
      return {
        success: false,
        error: "CREATE_RESET_TOKEN_ERROR",
        details: { database: [dbError.message] },
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}${appRoutes.auth.resetPassword}?token=${token}`
    const emailLocale = resolveEmailLocale(validation.data.locale)

    await sendEmail({
      to: email,
      subject:
        emailLocale === "ar"
          ? "استعادة كلمة المرور 🔒"
          : "Reset your password 🔒",
      reactComponent: React.createElement(ResetPasswordEmail, {
        locale: emailLocale,
        firstName:
          profile.first_name || (emailLocale === "ar" ? "عميلنا" : "Customer"),
        resetUrl: resetUrl,
      }),
    })

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: "REQUEST_PASSWORD_RESET_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}
