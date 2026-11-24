"use server"

import crypto from "crypto"
import React from "react"
import { z } from "zod"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { resolveEmailLocale } from "@/lib/services/email/locale"
import { sendEmail } from "@/lib/services/email/send-email"
import ResetPasswordOtpEmail from "@/lib/services/email/templates/reset-password-otp-email"

const MAX_ACTIVE_CODES = 5
const CODE_TTL_MINUTES = 15

const requestMobileOtpSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  locale: z.string().optional(),
})

export interface RequestMobileOtpResult {
  retryAfterSeconds?: number
}

export async function requestMobilePasswordResetOtp(
  input: unknown
): Promise<ApiResult<RequestMobileOtpResult>> {
  const parsed = requestMobileOtpSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
    }
  }

  const { email, locale } = parsed.data
  const emailLocale = resolveEmailLocale(locale)

  try {
    const supabaseAdmin = createAdminClient()

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, email")
      .eq("email", email)
      .single()

    // تجنب كشف وجود البريد الإلكتروني في النظام
    if (profileError || !profile) {
      return { success: true, data: {} }
    }

    const nowIso = new Date().toISOString()

    // جلب الأكواد غير المستخدمة وغير المنتهية للمستخدم
    const { data: activeTokens, error: activeError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, expires_at, created_at")
      .eq("user_id", profile.id)
      .is("used_at", null)
      .gt("expires_at", nowIso)
      .order("expires_at", { ascending: true })

    if (activeError) {
      return {
        success: false,
        error: "CHECK_ACTIVE_CODES_ERROR",
        details: { database: [activeError.message] },
      }
    }

    if (activeTokens && activeTokens.length >= MAX_ACTIVE_CODES) {
      const earliestExpiryMs = new Date(activeTokens[0].expires_at).getTime()
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((earliestExpiryMs - Date.now()) / 1000)
      )

      return {
        success: false,
        error: "OTP_RATE_LIMIT_EXCEEDED",
        details: {
          retryAfterSeconds: [String(retryAfterSeconds)],
        },
      }
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString()
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)

    const { error: insertError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        email: profile.email ?? email,
        otp_code: otpCode,
        token: crypto.randomUUID(),
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      return {
        success: false,
        error: "CREATE_RESET_TOKEN_ERROR",
        details: { database: [insertError.message] },
      }
    }

    await sendEmail({
      to: email,
      subject:
        emailLocale === "ar"
          ? "رمز التحقق لاستعادة كلمة المرور 🔒"
          : "Your password reset verification code 🔒",
      reactComponent: React.createElement(ResetPasswordOtpEmail, {
        locale: emailLocale,
        firstName:
          profile.first_name || (emailLocale === "ar" ? "عميلنا" : "Customer"),
        otpCode,
        expiresInMinutes: CODE_TTL_MINUTES,
      }),
    })

    return { success: true, data: {} }
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