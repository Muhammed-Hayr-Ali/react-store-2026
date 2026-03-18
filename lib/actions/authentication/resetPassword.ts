"use server"

import { createAdminClient } from "@/lib/supabase/createAdminClient "
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
    console.log("🔍 [resetPassword] Starting password reset...")
    console.log("🔑 [resetPassword] Token length:", token?.length)
    console.log(
      "🔑 [resetPassword] Token (first 20 chars):",
      token?.substring(0, 20)
    )

    const supabase = createAdminClient()

    // 1. التحقق الذري من الرمز واستهلاكه (Atomic Claim)
    // ✅ هذه هي الدالة الآمنة التي تمنع الاستخدام المزدوج
    const { data: claimData, error: claimError } = await supabase.rpc(
      "claim_password_reset_token",
      { p_token: token?.trim() } // ✅ Trim any whitespace
    )

    console.log("📊 [resetPassword] Claim Response:", {
      claimData,
      claimError,
    })

    if (claimError || !claimData?.[0]?.is_valid) {
      console.error("❌ [resetPassword] Token claim failed:", claimError)
      return {
        success: false,
        error: claimData?.[0]?.message || "رمز غير صالح أو منتهي الصلاحية",
      }
    }

    const { user_id, email } = claimData[0]
    console.log("✅ [resetPassword] Token claimed for user:", email)

    // 2. تحديث كلمة المرور في Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user_id,
      { password }
    )

    if (updateError) {
      console.error("❌ [resetPassword] Error updating password:", updateError)
      return {
        success: false,
        error: "فشل تحديث كلمة المرور",
      }
    }

    // ✅ الرمز تم استهلاكه تلقائياً عبر claim_password_reset_token
    // لا حاجة لاستدعاء دالة منفصلة

    console.log("✅ [resetPassword] Password reset successful for user:", email)

    return {
      success: true,
    }
  } catch (error) {
    console.error("❌ [resetPassword] Password reset error:", error)
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
    console.log("🔍 [verifyResetToken] Starting verification...")
    console.log("🔑 [verifyResetToken] Token length:", token?.length)
    console.log(
      "🔑 [verifyResetToken] Token (first 20 chars):",
      token?.substring(0, 20)
    )

    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc("verify_password_reset_token", {
      p_token: token?.trim(), // ✅ Trim any whitespace
    })

    console.log("📊 [verifyResetToken] RPC Response:", {
      data,
      error,
    })

    if (error || !data?.[0]?.is_valid) {
      console.error("❌ [verifyResetToken] Token verification failed:", error)
      return { isValid: false }
    }

    console.log(
      "✅ [verifyResetToken] Token is valid for email:",
      data[0].email
    )

    return {
      isValid: true,
      email: data[0].email,
      expiresAt: data[0].expires_at,
    }
  } catch (error) {
    console.error("❌ [verifyResetToken] Token verification error:", error)
    return { isValid: false }
  }
}
