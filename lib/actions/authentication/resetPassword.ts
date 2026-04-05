"use server";

import { createAdminClient } from "@/lib/database/supabase/admin";
import { ApiResult } from "@/lib/database/types";
<<<<<<< HEAD
import {
  resetPasswordSchema,
  validateInput,
  logAuthentication,
} from "@/lib/security";
import { verifyCsrfToken } from "@/lib/security/csrf-server-action";
=======
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

// ===============================================================================
// Reset Password with Token
// ===============================================================================

export interface ResetPasswordResult extends ApiResult {
  error?: string;
}

/**
 * إعادة تعيين كلمة المرور باستخدام الرمز
 *
<<<<<<< HEAD
 * @param _prevState حالة النموذج
 * @param formData بيانات النموذج
 * @returns نتيجة العملية
 */
export async function resetPassword(
  _prevState: unknown,
  formData: FormData,
): Promise<ResetPasswordResult> {
  const csrfCheck = await verifyCsrfToken(formData);
  if (!csrfCheck.valid) {
    return {
      success: false,
      error: "CSRF_ERROR",
    };
  }

  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  const validation = validateInput(resetPasswordSchema, { token, password });

  if (!validation.success) {
    return {
      success: false,
      error: validation.errors.join(", "),
    };
  }

  const { token: validatedToken, password: validatedPassword } =
    validation.data;

  try {
    const supabase = createAdminClient();

=======
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
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
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
<<<<<<< HEAD
    )("claim_password_reset_token", {
      p_token: validatedToken,
    });

    if (claimError || !claimData?.[0]?.is_valid) {
      logAuthentication("PASSWORD_RESET_SUCCESS", undefined, undefined, {
        reason: "INVALID_TOKEN",
      });
      return {
        success: false,
        error: "TOKEN_INVALID",
      };
    }

    const userId = claimData[0].user_id || claimData[0].profile_id;

    if (!userId) {
      logAuthentication("PASSWORD_RESET_SUCCESS", undefined, undefined, {
        reason: "NO_USER_ID",
      });
      return {
        success: false,
        error: "UNEXPECTED_ERROR",
      };
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: validatedPassword },
    );

    if (updateError) {
      logAuthentication("PASSWORD_RESET_SUCCESS", userId, undefined, {
        reason: "UPDATE_FAILED",
      });
      return {
        success: false,
        error: "UNEXPECTED_ERROR",
      };
    }

    logAuthentication("PASSWORD_RESET_SUCCESS", userId);

    return { success: true };
  } catch {
    logAuthentication("PASSWORD_RESET_SUCCESS", undefined, undefined, {
      reason: "UNEXPECTED_ERROR",
    });
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
=======
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
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
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
<<<<<<< HEAD
      p_token: token.trim(),
=======
      p_token: token?.trim(), // ✅ Trim any whitespace
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
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
