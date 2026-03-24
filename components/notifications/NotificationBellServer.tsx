import { createServerClient } from "@/lib/supabase/createServerClient"

import NotificationBell from "./NotificationBell"
import type { Notification } from "./types"

/**
 * Server Component wrapper for NotificationBell
 * Fetches user notifications on the server before rendering
 */
export default async function NotificationBellServer() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let notifications: Notification[] = []

  if (user) {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    notifications = data || []
  }

  return user ? <NotificationBell initialNotifications={notifications} /> : null
}
