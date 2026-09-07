"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { redirect } from "next/navigation"

export type Role = "admin" | "customer" | "vendor" | "moderator"

interface UserAppMetadata {
  role?: Role
  permissions?: string[]
}

/**
 * يجلب بيانات دور المستخدم وصلاحياته من Supabase.
 *
 * يتحقق من المستخدم الحالي:
 * - إذا لم يكن هناك مستخدم مسجل الدخول، فإنه يُرجع دور "customer" وصلاحيات افتراضية.
 * - إذا كان هناك مستخدم، فإنه يقرأ `app_metadata` للحصول على الدور والصلاحيات.
 * - إذا لم يتم تعيين الدور أو الصلاحيات في `app_metadata`، فإنه يستخدم القيم الافتراضية.
 *
 * @returns {Promise<{ role: Role; permissions: string[] }>} كائن يحتوي على دور المستخدم ومصفوفة صلاحياته.
 */
export async function getUserRoleData(): Promise<{
  role: Role
  permissions: string[]
}> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { role: "customer", permissions: ["view_products"] }
  }

  const appMetadata = user.app_metadata as UserAppMetadata | undefined

  return {
    role: appMetadata?.role || "customer",
    permissions: appMetadata?.permissions || ["view_products"],
  }
}

/**
 * يجلب دور المستخدم الحالي فقط.
 *
 * @returns {Promise<Role>} دور المستخدم الحالي.
 */
export async function getUserRole(): Promise<Role> {
  const data = await getUserRoleData()
  return data.role
}

/**
 * يجلب صلاحيات المستخدم الحالي فقط.
 *
 * @returns {Promise<string[]>} مصفوفة تحتوي على صلاحيات المستخدم.
 */
export async function getUserPermissions(): Promise<string[]> {
  const data = await getUserRoleData()
  return data.permissions
}

/**
 * يتحقق مما إذا كان لدى المستخدم الحالي صلاحية معينة.
 *
 * @param {string} permission - الصلاحية المطلوب التحقق منها.
 * @returns {Promise<boolean>} `true` إذا كان المستخدم يمتلك الصلاحية، وإلا `false`.
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const permissions = await getUserPermissions()
  return permissions.includes(permission)
}

/**
 * يتطلب أن يكون المستخدم الحالي "admin".
 * إذا لم يكن المستخدم "admin"، فسيتم إعادة توجيهه إلى صفحة "/unauthorized".
 * هذه الدالة مخصصة للاستخدام في Server Components أو Server Actions لحماية المسارات.
 *
 * @returns {Promise<Role>} يُرجع دور "admin" إذا كان المستخدم كذلك.
 * @throws {Error} سيتم إعادة توجيه المستخدم إذا لم يكن لديه الدور المطلوب.
 */
export async function requireAdmin() {
  const role = await getUserRole()
  if (role !== "admin") {
    redirect("/unauthorized")
  }
}

/**
 * يتطلب أن يمتلك المستخدم الحالي صلاحية معينة.
 * إذا لم يكن المستخدم يمتلك الصلاحية، فسيتم إعادة توجيهه إلى صفحة "/unauthorized".
 * هذه الدالة مخصصة للاستخدام في Server Components أو Server Actions لحماية الإجراءات.
 *
 * @param {string} permission - الصلاحية المطلوبة.
 * @throws {Error} سيتم إعادة توجيه المستخدم إذا لم يكن لديه الصلاحية المطلوبة.
 */
export async function requirePermission(permission: string) {
  const has = await hasPermission(permission)
  if (!has) {
    redirect("/unauthorized")
  }
}
