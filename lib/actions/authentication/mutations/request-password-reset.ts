/**
 * @file lib/actions/authentication/mutations/request-password-reset.ts
 * @description Initiates a password reset request and delivers a secure reset token via email.
 */

"use server"

import React from "react"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { sendEmail } from "@/lib/services/email/send-email"
import ResetPasswordEmail from "@/lib/services/email/templates/reset-password-email"
import { appRoutes } from "@/lib/config/app-routes"
import { requestPasswordResetSchema } from "../schemas"
import { ApiResult } from "../types"

export async function requestPasswordReset(
  payload: unknown
): Promise<ApiResult<null>> {
  // Step 1: Input Validation
  const validation = requestPasswordResetSchema.safeParse(payload)
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

  const { email } = validation.data

  try {
    // Step 2: Supabase Admin Client Initialization
    const supabaseAdmin = createAdminClient()

    // Step 3: Lookup User Profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, email")
      .eq("email", email)
      .single()

    // Timing Attack Mitigation: Return success even if email is not found
    if (profileError || !profile) {
      return { success: true, data: null }
    }

    // Step 4: Token Generation & Expiration Setup
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

    // Step 5: Deliver Reset Email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}${appRoutes.auth.resetPassword}?token=${token}`

    await sendEmail({
      to: email,
      subject: "Password Reset Request - Marketna",
      reactComponent: React.createElement(ResetPasswordEmail, {
        firstName: profile.first_name || "Customer",
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