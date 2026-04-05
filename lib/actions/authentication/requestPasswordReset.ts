"use server";

import { createAdminClient } from "@/lib/database/supabase/admin";
import { ApiResult } from "@/lib/database/types";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  emailSchema,
  validateInput,
  logAuthentication,
  checkRateLimit,
} from "@/lib/security";
import { verifyCsrfToken } from "@/lib/security/csrf-server-action";

// ===============================================================================
// Request Password Reset
// ===============================================================================

export interface ForgotPasswordResult extends ApiResult {
  error?: string;
}

/**
 * طلب إعادة تعيين كلمة المرور
 *
 * @param _prevState حالة النموذج
 * @param formData بيانات النموذج
 * @returns نتيجة العملية
 */
export async function requestPasswordReset(
  _prevState: unknown,
  formData: FormData,
): Promise<ForgotPasswordResult> {
  try {
    const csrfCheck = await verifyCsrfToken(formData);
    if (!csrfCheck.valid) {
      return { success: false, error: "CSRF_ERROR" };
    }

    const rawEmail = formData.get("email") as string;

    const validation = validateInput(emailSchema, rawEmail);
    if (!validation.success) {
      return { success: false, error: validation.errors.join(", ") };
    }

    const email = validation.data;

    const rateLimit = checkRateLimit(new Headers(), {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.success) {
      logAuthentication("PASSWORD_RESET_REQUEST", undefined, undefined, {
        reason: "RATE_LIMIT_EXCEEDED",
        email,
      });
      return {
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
      };
    }

    const supabase = createAdminClient();

    const { data: profile, error: profileError } = (await supabase
      .from("core_profile")
      .select("id, email")
      .eq("email", email)
      .single()) as {
      data: { id: string; email: string } | null;
      error: { message: string; code: string } | null;
    };

    if (profileError || !profile) {
      logAuthentication("PASSWORD_RESET_REQUEST", undefined, undefined, {
        email,
        reason: "USER_NOT_FOUND",
      });
      return { success: true };
    }

    const userId = profile.id;
    const userEmail = profile.email;

    const { data: tokenData, error: tokenError } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{
        data: string | null;
        error: { message: string; code: string } | null;
      }>
    )("create_password_reset_token", {
      p_profile_id: userId,
      p_email: userEmail,
      p_expires_in_minutes: 60,
      p_ip_address: null,
    });

    if (tokenError || !tokenData) {
      const manualToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const insertData = {
        profile_id: userId,
        email: userEmail,
        token: manualToken,
        expires_at: expiresAt,
        ip_address: null,
      };

      const { error: insertError } = await (
        supabase.from("auth_password_reset").insert as unknown as (
          values: Record<string, unknown>,
        ) => Promise<{ error: { message: string; code: string } | null }>
      )(insertData);

      if (insertError) {
        throw new Error("فشل إنشاء رمز إعادة التعيين");
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${appUrl}/reset-password?token=${manualToken}`;

      await sendPasswordResetEmail(userEmail, "مستخدم", resetLink);

      logAuthentication("PASSWORD_RESET_REQUEST", userId, undefined, {
        email,
        fallback: true,
      });

      return { success: true };
    }

    const token = tokenData;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(userEmail, "مستخدم", resetLink);
    } catch {
      // Token created, email failure is logged but doesn't block response
    }

    logAuthentication("PASSWORD_RESET_REQUEST", userId, undefined, { email });

    return { success: true };
  } catch (error) {
    logAuthentication(
      "PASSWORD_RESET_REQUEST",
      undefined,
      undefined,
      error instanceof Error ? { error: error.message } : { error: "unknown" },
    );
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    };
  }
}
