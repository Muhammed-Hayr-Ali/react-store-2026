import { redirect } from "next/navigation";
import { createClient } from "@/lib/database/supabase/server";
import { appRouter } from "@/lib/navigation";
import type { User } from "@supabase/supabase-js";

// =====================================================
// 🔐 Dashboard Permission Guard (Single-Merchant)
// =====================================================

// الأدوار المسموح لها بدخول الداشبورد
export type DashboardRole =
  | "admin"
  | "vendor"
  | "customer"
  | "delivery"
  | "support";

/**
 * فحص صلاحية الداشبورد
 * 1. هل المستخدم مسجل دخول؟
 * 2. جلب أدوار المستخدم
 * 3. هل الدور موجود في القائمة المسموح بها؟
 */
export async function requireDashboardRole(
  allowedRole: DashboardRole,
): Promise<void> {
  const supabase = await createClient();

  // 1️⃣ فحص تسجيل الدخول
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return redirect(appRouter.signIn);
  }

  // 2️⃣ التحقق من الدور (باستخدام RPC إذا كان متوفراً أو Query مباشر)
  const { data: profileData, error: profileError } = await supabase.rpc(
    "get_user_full_profile",
  );

  if (profileError || !profileData) {
    // في حال عدم وجود RPC، نستخدم Query المباشر
    const { data: roles } = await supabase
      .from("core_profile_role")
      .select("core_role(code)")
      .eq("profile_id", user.id);

    const userRoles =
      roles?.map((r: any) => r.core_role?.code).filter(Boolean) || [];
    if (!userRoles.includes(allowedRole)) {
      return redirect("/unauthorized");
    }
    return;
  }

  // استخدام بيانات البروفايل الكاملة
  const userRoles = profileData.roles?.map((r: any) => r.code) || [];
  if (!userRoles.includes(allowedRole)) {
    return redirect("/unauthorized");
  }
}

/**
 * فحص أدوار المستخدم فقط (بدون منع)
 * يُستخدم في Smart Router للداشبورد
 */
export async function checkUserRoles(): Promise<{
  user: User;
  roles: string[];
} | null> {
  const supabase = await createClient();

  // 1️⃣ فحص تسجيل الدخول
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // 2️⃣ جلب الأدوار (نستخدم RPC لأنه الأسرع والأشمل)
  const { data: profileData, error } = await supabase.rpc(
    "get_user_full_profile",
  );

  if (error) {
    // Fallback في حال عدم وجود الدالة
    const { data: roles } = await supabase
      .from("core_profile_role")
      .select("core_role(code)")
      .eq("profile_id", user.id);

    const userRoles =
      roles?.map((r: any) => r.core_role?.code).filter(Boolean) || [];
    return { user, roles: userRoles };
  }

  const roles = profileData?.roles?.map((r: any) => r.code) || [];
  return { user, roles };
}
