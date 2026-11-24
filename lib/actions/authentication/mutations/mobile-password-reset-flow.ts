"use server"

import { z } from "zod"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createAdminClient } from "@/lib/database/supabase/admin"

const verifyOtpSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  otpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
})

const confirmResetSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  otpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
  password: z.string().min(8),
})

/**
 * تتحقق من صحة البريد الإلكتروني ورمز التحقق (6 أرقام) دون استهلاك الرمز بعد.
 */
export async function verifyResetOtp(
  input: unknown
): Promise<ApiResult<{ valid: true }>> {
  const parsed = verifyOtpSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "VALIDATION_ERROR" }
  }

  const { email, otpCode } = parsed.data

  try {
    const supabaseAdmin = createAdminClient()
    const nowIso = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id")
      .eq("email", email)
      .eq("otp_code", otpCode)
      .is("used_at", null)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return { success: false, error: "INVALID_OR_EXPIRED_OTP" }
    }

    return { success: true, data: { valid: true } }
  } catch {
    return { success: false, error: "VERIFY_RESET_TOKEN_ERROR" }
  }
}

/**
 * تتحقق من البريد والرمز، تحدث كلمة المرور، وتُعلّم الرمز بأنه تم استخدامه.
 */
export async function confirmMobilePasswordReset(
  input: unknown
): Promise<ApiResult<null>> {
  const parsed = confirmResetSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "VALIDATION_ERROR" }
  }

  const { email, otpCode, password } = parsed.data

  try {
    const supabaseAdmin = createAdminClient()
    const nowIso = new Date().toISOString()

    const { data: tokenRow, error: findError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, user_id")
      .eq("email", email)
      .eq("otp_code", otpCode)
      .is("used_at", null)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (findError || !tokenRow) {
      return { success: false, error: "INVALID_OR_EXPIRED_OTP" }
    }

    const { error: updateAuthError } =
      await supabaseAdmin.auth.admin.updateUserById(tokenRow.user_id, {
        password,
      })

    if (updateAuthError) {
      return { success: false, error: "UPDATE_USER_PASSWORD_ERROR" }
    }

    // تعيين حالة أنه تم استخدام الرمز لمنع إعادة استخدامه
    const { error: markUsedError } = await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used_at: nowIso })
      .eq("id", tokenRow.id)
      .is("used_at", null)

    if (markUsedError) {
      return { success: false, error: "MARK_TOKEN_USED_ERROR" }
    }

    return { success: true, data: null }
  } catch {
    return { success: false, error: "CONFIRM_PASSWORD_RESET_ERROR" }
  }
}