<<<<<<< HEAD
import { redirect } from "next/navigation";
import { createClient } from "@/lib/database/supabase/server";
import { appRouter } from "@/lib/navigation/routes";
import { auditLog } from "@/lib/security/audit-logger";

/**
 * MFA Guard - التحقق من حالة المصادقة الثنائية
 *
 * 🎯 الوظيفة:
 * - يتحقق مما إذا كان المستخدم لديه MFA مفعل لكن لم يكمل التحقق بعد
 * - إذا currentLevel = aal1 و nextLevel = aal2 → يجب إكمال MFA → توجيه لصفحة verify
 * - إذا currentLevel = aal2 → MFA مكتمل → يُسمح بالمرور
 *
 * ⚠️ ملاحظة:
 * - يتخطى الصفحات المتعلقة بـ MFA (verify, two-factor/setup)
 * - يعمل AFTER AuthGuard (المستخدم يجب أن يكون مسجل دخول)
 */
export async function MfaGuard() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // المستخدم غير مسجل → AuthGuard سيتولى التوجيه
      return null;
    }

    const { data, error } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel(
        session.access_token,
      );

    if (error) {
      auditLog("SECURITY:MFA_CHECK_FAILED", {
        level: "warn",
        details: { message: error.message },
      });
      return null;
    }

    if (!data) {
      return null;
    }

    const { currentLevel, nextLevel } = data;

    // aal1 = مسجل لكن لم يكمل MFA
    // aal2 = أكمل MFA بنجاح
    if (currentLevel === "aal1" && nextLevel === "aal2") {
      const { headers } = await import("next/headers");
      const headersList = await headers();
      const pathname = headersList.get("x-invoke-path") || "";

      // لا تُعيد التوجيه إذا كان المستخدم في صفحات MFA نفسها
      const isMfaPage =
        pathname.includes("/verify") || pathname.includes("/two-factor");

      if (!isMfaPage) {
        redirect(appRouter.verifyOtp);
      }
    }

    // aal2 أو لا nextLevel → لا يحتاج MFA → يُسمح بالمرور
    return null;
  } catch (error) {
    auditLog("SECURITY:MFA_GUARD_ERROR", {
      level: "error",
      details: {
        error: error instanceof Error ? error.message : "unknown",
      },
    });
    return null;
=======
import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { appRouter } from "@/lib/navigation"

export async function MfaGuard() {
  try {
    const supabase = await createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    const jwt = session.access_token

    if (!jwt || jwt === "") {
      return null
    }

    const { data, error } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel(jwt)

    if (error) {
      console.error("[MfaGuard] AAL check failed:", {
        message: error.message ?? "Unknown error",
        status: error.status ?? "N/A",
        code: "N/A",
        error: JSON.stringify(error),
      })
      return null
    }

    if (!data) {
      console.warn("[MfaGuard] No AAL data returned")
      return null
    }

    const { currentLevel, nextLevel } = data

    if (currentLevel === "aal1" && nextLevel === "aal2") {
      redirect(appRouter.verifyOtp)
    }

    return null
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred"
    console.error("[MfaGuard] Unexpected error:", errorMessage)
    return null
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
  }
}
