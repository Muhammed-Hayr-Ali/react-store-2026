import { redirect } from "next/navigation";
import { createClient } from "@/lib/database/supabase/server";
import { appRouter } from "@/lib/navigation/routes";

/**
 * MFA Guard - التحقق من حالة المصادقة الثنائية
 *
 * 🎯 الوظيفة:
 * - يتحقق مما إذا كان المستخدم لديه MFA مفعل لكن لم يكمل التحقق بعد
 * - إذا currentLevel = aal1 و nextLevel = aal2 → يجب إكمال MFA → توجيه لصفحة verify
 * - إذا currentLevel = aal2 → MFA مكتمل → يُسمح بالمرور
 *
 * ⚠️ ملاحظة:
 * - يجب استخدام هذا في التخطيطات المحمية فقط (وليس في التخطيط الرئيسي)
 * - صفحات MFA (verify, two-factor) يجب أن تكون خارج هذا الحماية
 */
export async function MfaGuard(currentPathname?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // No session → AuthGuard will handle redirect
    if (!session) {
      return null;
    }

    // Ensure we have a valid access token before checking MFA
    if (!session.access_token) {
      return null;
    }

    // Get MFA assurance level
    const { data, error } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel(
        session.access_token,
      );

    // Error checking MFA → silently skip (don't block user)
    if (error) {
      return null;
    }

    // No data → skip
    if (!data) {
      return null;
    }

    const { currentLevel, nextLevel } = data;

    // aal1 = logged in but hasn't completed MFA
    // aal2 = completed MFA successfully
    if (currentLevel === "aal1" && nextLevel === "aal2") {
      // If we have a current pathname, check if we're already on an MFA page
      if (currentPathname) {
        const isMfaPage =
          currentPathname.includes("/verify") ||
          currentPathname.includes("/two-factor") ||
          currentPathname.includes("/mfa");

        // Already on MFA page → don't redirect
        if (isMfaPage) {
          return null;
        }
      }

      // Redirect to verify page
      redirect(appRouter.verifyOtp);
    }

    // aal2 or no nextLevel → no MFA needed → allow passage
    return null;
  } catch (error) {
    // Re-throw Next.js redirect error
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    // Silently ignore all other errors
    return null;
  }
}
