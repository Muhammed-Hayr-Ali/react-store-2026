// actions/notifications.ts
"use server"


import { createServerClient } from "@/lib/supabase/createServerClient"
import { revalidatePath } from "next/cache"

// جلب الإشعارات (آخر 20 إشعار)
export async function getNotifications() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}

// تحديد إشعار كمقروء
export async function markNotificationAsRead(id: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/") // تحديث الكاش
}

// تحديد الكل كمقروء
export async function markAllAsRead() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) throw error
  revalidatePath("/")
}
