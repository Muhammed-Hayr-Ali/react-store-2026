"use server";

import { createAdminClient } from "@/lib/database/supabase/admin";
import { ApiResult } from "@/lib/database/types";

// ===============================================================================
// Reset Password with Token
// ===============================================================================

export interface ResetPasswordResult extends ApiResult {
  error?: string;
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
  password: string,
): Promise<ResetPasswordResult> {
  try {
    const supabase = createAdminClient();

    // 1. التحقق الذري من الرمز واستهلاكه (Atomic Claim)
    // ✅ هذه هي الدالة الآمنة التي تمنع الاستخدام المزدوج
    type ClaimTokenResult = {
      data:
        | {
            is_valid: boolean;
            user_id?: string;
            profile_id?: string;
            message: string;
          }[]
        | null;
      error: { message: string; code: string } | null;
    };

    const { data: claimData, error: claimError } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<ClaimTokenResult>
    )(
      "claim_password_reset_token",
      { p_token: token?.trim() }, // ✅ Trim any whitespace
    );

    if (claimError || !claimData?.[0]?.is_valid) {
      return {
        success: false,
        error: claimData?.[0]?.message || "رمز غير صالح أو منتهي الصلاحية",
      };
    }

    // دعم كل من user_id و profile_id
    const userId = claimData[0].user_id || claimData[0].profile_id;

    if (!userId) {
      console.error(
        "claim_password_reset_token returned no user_id or profile_id",
        {
          claimData,
        },
      );
      return {
        success: false,
        error: "فشل في تحديد هوية المستخدم",
      };
    }

    // 2. تحديث كلمة المرور في Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password },
    );

    if (updateError) {
      console.error("updateUserById failed:", {
        userId,
        error: updateError.message,
        status: updateError.status,
      });
      return {
        success: false,
        error: "فشل تحديث كلمة المرور",
      };
    }

    // ✅ الرمز تم استهلاكه تلقائياً عبر claim_password_reset_token
    // لا حاجة لاستدعاء دالة منفصلة

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "حدث خطأ غير متوقع",
    };
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
  token: string,
): Promise<{ isValid: boolean; email?: string; expiresAt?: string }> {
  try {
    const supabase = createAdminClient();

    type VerifyTokenResult = {
      data: { is_valid: boolean; email: string; expires_at: string }[] | null;
      error: { message: string; code: string } | null;
    };

    const { data, error } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<VerifyTokenResult>
    )("verify_password_reset_token", {
      p_token: token?.trim(), // ✅ Trim any whitespace
    });

    if (error || !data?.[0]?.is_valid) {
      return { isValid: false };
    }

    return {
      isValid: true,
      email: data[0].email,
      expiresAt: data[0].expires_at,
    };
  } catch {
    return { isValid: false };
  }
}
