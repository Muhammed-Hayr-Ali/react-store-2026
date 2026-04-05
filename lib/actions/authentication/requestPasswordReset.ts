"use server";

import { createAdminClient } from "@/lib/database/supabase/admin";
import { ApiResult } from "@/lib/database/types";
import { sendPasswordResetEmail } from "@/lib/email";
<<<<<<< HEAD
import {
  emailSchema,
  validateInput,
  logAuthentication,
  checkRateLimit,
} from "@/lib/security";
import { verifyCsrfToken } from "@/lib/security/csrf-server-action";
=======
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

// ===============================================================================
// Request Password Reset
// ===============================================================================

export interface ForgotPasswordResult extends ApiResult {
  error?: string;
}

/**
<<<<<<< HEAD
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
=======
 * الحصول على عنوان IP من الطلب (للتدقيق الأمني)
 */
async function getClientIP(): Promise<string | null> {
  try {
    const { headers } = await import("next/headers");
    const headersList = await headers();

    // التحقق من X-Forwarded-For (قد يحتوي على IPs متعددة)
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      // أخذ أول IP في القائمة (العميل الأصلي)
      return forwardedFor.split(",")[0].trim();
    }

    // التحقق من X-Real-IP
    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * طلب إعادة تعيين كلمة المرور
 *
 * @param email البريد الإلكتروني للمستخدم
 * @returns نتيجة العملية
 */
export async function requestPasswordReset(
  email: string,
): Promise<ForgotPasswordResult> {
  try {
    // التحقق من المتغيرات البيئية
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      throw new Error("Missing Supabase credentials");
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    }

    const supabase = createAdminClient();

<<<<<<< HEAD
=======
    // 1. البحث عن المستخدم عبر البريد في core_profile
    type ProfileQueryResult = {
      data: { id: string; email: string } | null;
      error: { message: string; code: string } | null;
    };

>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    const { data: profile, error: profileError } = (await supabase
      .from("core_profile")
      .select("id, email")
      .eq("email", email)
<<<<<<< HEAD
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
=======
      .single()) as ProfileQueryResult;

    if (profileError || !profile) {
      // لا نكشف إذا كان البريد موجوداً أم لا للأمان
      return {
        success: true,
      };
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    }

    const userId = profile.id;
    const userEmail = profile.email;

<<<<<<< HEAD
=======
    // 2. الحصول على IP للتدقيق الأمني
    const clientIP = await getClientIP();

    // 3. إنشاء رمز جديد (الدالة تبطل الرموز القديمة تلقائياً)
    // ✅ ملاحظة: لا نتحقق من الرموز الموجودة لأن الدالة تفعل ذلك تلقائياً
    type CreateTokenResult = {
      data: string | null;
      error: { message: string; code: string } | null;
    };

>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    const { data: tokenData, error: tokenError } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
<<<<<<< HEAD
      ) => Promise<{
        data: string | null;
        error: { message: string; code: string } | null;
      }>
=======
      ) => Promise<CreateTokenResult>
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    )("create_password_reset_token", {
      p_profile_id: userId,
      p_email: userEmail,
      p_expires_in_minutes: 60,
<<<<<<< HEAD
      p_ip_address: null,
    });

    if (tokenError || !tokenData) {
      const manualToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
=======
      p_ip_address: clientIP || null,
    });

    if (tokenError || !tokenData) {
      console.error("Error creating reset token:", {
        tokenError,
        data: tokenData,
        userId,
      });

      // إذا فشلت الدالة، ننشئ الرمز يدوياً باستخدام Web Crypto API
      const manualToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 دقيقة

      type InsertResult = {
        error: { message: string; code: string } | null;
      };
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2

      const insertData = {
        profile_id: userId,
        email: userEmail,
        token: manualToken,
        expires_at: expiresAt,
<<<<<<< HEAD
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
=======
        ip_address: clientIP || null,
      };

      type InsertQueryBuilder = (
        values: Record<string, unknown>,
      ) => Promise<InsertResult>;

      const { error: insertError } = await (
        supabase.from("auth_password_reset")
          .insert as unknown as InsertQueryBuilder
      )(insertData);

      if (insertError) {
        console.error("Error manually creating token:", insertError);
        throw new Error("فشل إنشاء رمز إعادة التعيين");
      }

      const token = manualToken;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${appUrl}/reset-password?token=${token}`;

      await sendPasswordResetEmail(userEmail, "مستخدم", resetLink);

      return {
        success: true,
      };
    }

    const token = tokenData;

    // 4. إنشاء رابط إعادة التعيين
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    // 5. إرسال البريد الإلكتروني
    try {
      await sendPasswordResetEmail(userEmail, "مستخدم", resetLink);
      console.log("Password reset email sent successfully");
    } catch (emailError) {
      console.error("Failed to send email, but token was created:", emailError);
      // لا نرمي خطأ - الرمز تم إنشاؤه بنجاح
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error: "حدث خطأ غير متوقع",
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
    };
  }
}
