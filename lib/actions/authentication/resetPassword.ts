"use server"

import { createAdminClient } from "@/lib/supabase/createAdminClient"
import { ApiResult } from "@/lib/types/common"

// ===============================================================================
// Reset Password with Token
// ===============================================================================

export interface ResetPasswordResult extends ApiResult {
  error?: string
}

/**
 * إعادة تعيين كلمة المرور باستخدام الرمز
 *
 * @param token رمز إعادة التعيين
 * @param password كلمة المرور الجديدة
 * @returns نتيجة العملية
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<ResetPasswordResult> {
  try {
    const supabase = createAdminClient()

    // 1. التحقق الذري من الرمز واستهلاكه (Atomic Claim)
    // ✅ هذه هي الدالة الآمنة التي تمنع الاستخدام المزدوج
    const { data: claimData, error: claimError } = await supabase.rpc(
      "claim_password_reset_token",
      { p_token: token }
    )

    if (claimError || !claimData?.[0]?.is_valid) {
      return {
        success: false,
        error: claimData?.[0]?.message || "رمز غير صالح أو منتهي الصلاحية",
      }
    }

    const { user_id, email } = claimData[0]

    // 2. تحديث كلمة المرور في Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user_id,
      { password }
    )

    if (updateError) {
      console.error("Error updating password:", updateError)
      return {
        success: false,
        error: "فشل تحديث كلمة المرور",
      }
    }

    // ✅ الرمز تم استهلاكه تلقائياً عبر claim_password_reset_token
    // لا حاجة لاستدعاء دالة منفصلة

    console.log(`Password reset successful for user: ${email}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Password reset error:", error)
    return {
      success: false,
      error: "حدث خطأ غير متوقع",
    }
  }
}

/**
 * التحقق من رمز إعادة التعيين (للاستخدام في الصفحة - للعرض فقط)
 *
 * ⚠️ تحذير: هذه الدالة للعرض فقط، لا تعتمد عليها للأمان.
 * يجب استخدام claim_password_reset_token في resetPassword للأمان.
 *
 * @param token رمز إعادة التعيين
 * @returns هل الرمز صالح أم لا
 */
export async function verifyResetToken(
  token: string
): Promise<{ isValid: boolean; email?: string; expiresAt?: string }> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc("verify_password_reset_token", {
      p_token: token,
    })

    if (error || !data?.[0]?.is_valid) {
      return { isValid: false }
    }

    return {
      isValid: true,
      email: data[0].email,
      expiresAt: data[0].expires_at,
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return { isValid: false }
  }
}
