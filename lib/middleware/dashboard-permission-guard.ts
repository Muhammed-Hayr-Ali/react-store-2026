import { redirect } from "next/navigation";
import { createClient } from "@/lib/database/supabase/server";
import { appRouter } from "@/lib/navigation";
import type { User } from "@supabase/supabase-js";

// =====================================================
// 🔐 Dashboard Permission Guard
// =====================================================

export type DashboardRole = "customer" | "seller" | "driver" | "admin";

type RoleRow = {
  core_role: { code: string } | null;
};

/**
 * فحص صلاحية الداشبورد
 *
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

  // 2️⃣ جلب أدوار المستخدم
  const { data: roles, error } = await supabase
    .from("core_profile_role")
    .select(
      `
      core_role (
        code
      )
    `,
    )
    .eq("profile_id", user.id)
    .returns<RoleRow[]>();

  if (error) {
    return redirect("/unauthorized");
  }

  const userRoles = roles
    .map((r) => r.core_role?.code)
    .filter((code): code is string => !!code);

  // 3️⃣ التحقق من الصلاحية
  if (!userRoles.includes(allowedRole)) {
    return redirect("/unauthorized");
  }
}

/**
 * فحص أدوار المستخدم فقط (بدون منع)
 * يُستخدم في Smart Router
 */
export async function checkUserRoles(): Promise<{
  user: User;
  roles: string[];
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: roles, error } = await supabase
    .from("core_profile_role")
    .select(
      `
      core_role (
        code
      )
    `,
    )
    .eq("profile_id", user.id)
    .returns<RoleRow[]>();

  if (error) {
    return { user, roles: [] };
  }

  const userRoles = roles
    .map((r) => r.core_role?.code)
    .filter((code): code is string => !!code);

  return { user, roles: userRoles };
}
