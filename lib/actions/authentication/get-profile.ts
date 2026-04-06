import { createClient } from "@/lib/database/supabase/server";

// =====================================================
// 👤 User Profile Actions
// =====================================================

/**
 * جلب أدوار المستخدم من قاعدة البيانات
 */
export async function getUserRoles(): Promise<string[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  type RoleRow = {
    core_role: { code: string } | null;
  };

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

  if (error) return [];

  return roles
    .map((r) => r.core_role?.code)
    .filter((code): code is string => !!code);
}

/**
 * جلب الملف الشخصي الكامل للمستخدم
 */
export async function getUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("core_profile")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return profile;
}
