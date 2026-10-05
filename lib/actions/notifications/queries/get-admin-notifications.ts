import { createClient } from "@/lib/database/supabase/server"

export async function getAdminNotifications() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      *,
      profiles:user_id (
        first_name,
        last_name,
        email,
        profile_image
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin notifications:", error)
    return { success: false, data: [] }
  }

  return { success: true, data }
}
