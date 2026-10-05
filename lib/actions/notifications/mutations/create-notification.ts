"use server"

import { createClient } from "@/lib/database/supabase/server"
import {
  createNotificationSchema,
  broadcastNotificationSchema,
} from "../schemas"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// Create a single notification for a specific user
export async function createNotification(
  input: z.infer<typeof createNotificationSchema>
) {
  const result = createNotificationSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const supabase = await createClient()

  // Optional: Check if the current user is authorized to send notifications
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: result.data.userId,
    title: result.data.title,
    message: result.data.message,
    type: result.data.type,
    link: result.data.link || null,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Broadcast notifications to all users or users with a specific role
export async function broadcastNotification(
  input: z.infer<typeof broadcastNotificationSchema>
) {
  const result = broadcastNotificationSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const { title, message, type, link, targetType, roleName } = result.data

  let targetUserIds: string[] = []

  if (targetType === "all") {
    // Fetch all users from auth or profiles table (assuming profiles table has user IDs)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")

    if (profilesError) {
      return { success: false, error: "Failed to fetch target users" }
    }
    targetUserIds = profiles?.map((p) => p.id) || []
  } else if (targetType === "role" && roleName) {
    // Fetch users having the specified role
    const { data: roleMembers, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", roleName)

    if (roleError) {
      return { success: false, error: "Failed to fetch users by role" }
    }
    targetUserIds = roleMembers?.map((r) => r.user_id) || []
  }

  if (targetUserIds.length === 0) {
    return { success: false, error: "No target users found for this broadcast" }
  }

  // Prepare batch insert payload
  const notificationsPayload = targetUserIds.map((userId) => ({
    user_id: userId,
    title,
    message,
    type,
    link: link || null,
  }))

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notificationsPayload)

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath("/")
  return { success: true, count: targetUserIds.length }
}
