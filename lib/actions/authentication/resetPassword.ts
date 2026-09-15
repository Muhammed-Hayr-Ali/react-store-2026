// lib/actions/authentication/resetPassword.ts
"use server"

import { createAdminClient } from "@/lib/database/supabase/admin"
import { ApiResult } from "@/lib/database/types/utils"
import { sendEmail } from "@/lib/services/email/send-email"
import ResetPasswordEmail from "@/lib/services/email/templates/reset-password-email"
import React from "react"

export async function requestPasswordReset(
  email: string
): Promise<ApiResult<null>> {
  try {
    // initialize Supabase Admin client
    const supabaseAdmin = createAdminClient()
    // read the user's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, email")
      .eq("email", email)
      .single()

    // check if the user exists
    if (profileError) {
      if (profileError.code === "PGRST116") {
        return { success: true, data: null }
      }
      throw new Error("DATABASE_READ_ERROR")
    }

    // check if the user exists
    if (!profile) {
      return { success: true, data: null }
    }

    // generate a random token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // insert the token into the database
    const { error: dbError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        token: token,
        expires_at: expiresAt.toISOString(),
      })

    // check if the insertion was successful
    if (dbError) {
      throw new Error("TOKEN_INSERT_FAILED")
    }

    // get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    // generate the reset URL
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

    //  send the email
    await sendEmail({
      to: email,
      subject: "Password Reset Request - Marketna",
      reactComponent: React.createElement(ResetPasswordEmail, {
        firstName: profile.first_name,
        resetUrl: resetUrl,
      }),
    })

    // return success
    return { success: true, data: null }
  } catch (error) {
    //   handle errors
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "FAILED_TO_SEND_RESET_EMAIL",
    }
  }
}

// 2. Function to execute the password reset (update the password)
export async function confirmPasswordReset(
  token: string | null,
  newPassword: string
): Promise<ApiResult<null>> {
  try {
    if (!token) {
      return { success: false, error: "MISSING_TOKEN" }
    }

    const supabaseAdmin = createAdminClient()

    // Verify the token via the secure function in the database
    const { data: userId, error: verifyError } = await supabaseAdmin.rpc(
      "verify_and_use_reset_token",
      {
        p_token: token,
      }
    )

    if (verifyError || !userId) {
      return { success: false, error: "INVALID_OR_EXPIRED_TOKEN" }
    }

    // Update the password using the Admin API
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
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
