/**
 * @file app/api/auth/test-permissions/route.ts
 * @description Diagnostic API endpoint to inspect current user, assigned roles, permissions array, and has_permission evaluation.
 */

import { createClient } from "@/lib/database/supabase/server"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. جلب المستخدم الحالي المسجل دخوله عبر الجلسة
    const userResult = await getCurrentUser()
    
    if (!userResult.success || !userResult.data) {
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          message: "لا يوجد مستخدم مسجل دخول حالياً (Not authenticated)",
        },
        { status: 200 }
      )
    }

    const currentUser = userResult.data

    // 2. جلب الأدوار والصلاحيات المرتبطة مباشرة من قاعدة البيانات للتشخيص
    const { data: userRolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select(`
        id,
        roles (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq("user_id", currentUser.id)

    if (rolesError) {
      console.error("[Test Permissions API] Error fetching roles:", rolesError)
    }

    const rolesList: unknown[] = []
    const allPermissions: string[] = []

    if (userRolesData) {
      for (const item of userRolesData) {
        const roleRecord = item.roles as unknown as {
          id: string
          name: string
          description: string | null
          permissions: string[] | string
        }

        if (roleRecord) {
          rolesList.push({
            role_id: roleRecord.id,
            role_name: roleRecord.name,
            description: roleRecord.description,
          })

          // فك الـ permissions سواء كانت مخزنة كـ Array أو JSON String
          const perms =
            typeof roleRecord.permissions === "string"
              ? JSON.parse(roleRecord.permissions)
              : roleRecord.permissions

          if (Array.isArray(perms)) {
            allPermissions.push(...perms)
          }
        }
      }
    }

    // 3. اختبار دالة الـ hasPermission الفعلية لصلاحية إدارة التقييمات
    const canManageReviews = await hasPermission(PERMISSIONS.MANAGE_REVIEWS)

    // 4. إرجاع تقرير تشخيصي شامل
    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: {
          id: currentUser.id,
          email: currentUser.email,
          name: `${currentUser.first_name ?? ""} ${currentUser.last_name ?? ""}`.trim(),
        },
        authorization: {
          assigned_roles: rolesList,
          extracted_permissions: Array.from(new Set(allPermissions)),
          has_manage_reviews_permission: canManageReviews,
        },
      },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error occurred"
    console.error("[Test Permissions API] Critical Error:", err)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}