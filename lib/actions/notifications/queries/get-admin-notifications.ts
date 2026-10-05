/**
 * @file lib/actions/notifications/queries/get-admin-notifications.ts
 * @description Server Action to fetch all notifications for admin management.
 */

"use server"

import { createClient } from "@/lib/database/supabase/server"

export async function getAdminNotifications() {
  const supabase = await createClient()

  // 1. جلب الإشعارات مرتبة تنازلياً
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin notifications:", error)
    return { success: false, data: [] }
  }

  if (!notifications || notifications.length === 0) {
    return { success: true, data: [] }
  }

  // 2. جمع معرفات المستخدمين الفريدة لجلب بياناتهم الشخصية دفعة واحدة
  const userIds = Array.from(new Set(notifications.map((n) => n.user_id)))

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, profile_image")
    .in("id", userIds)

  // 3. دمج بيانات الملف الشخصي مع كل إشعار لتظهر في جدول الإدارة
  const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  const enrichedNotifications = notifications.map((notification) => ({
    ...notification,
    profiles: profilesMap.get(notification.user_id) || null,
  }))

  return { success: true, data: enrichedNotifications }
}
