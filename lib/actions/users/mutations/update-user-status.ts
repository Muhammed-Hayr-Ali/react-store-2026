"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/database/supabase/server"
import { ActionResponse, UserStatus } from "../types"

interface UpdateUserStatusParams {
  userId: string
  status: UserStatus
  banReason?: string
}

export async function updateUserStatus({
  userId,
  status,
  banReason,
}: UpdateUserStatusParams): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const isBanned = status === "banned"

    const updatePayload = {
      status,
      ban_reason: isBanned
        ? banReason?.trim() || "Administrative action"
        : null,
      banned_at: isBanned ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)

    if (error) {
      console.error("Error updating user status:", error.message)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (err) {
    console.error("Unexpected error in updateUserStatus:", err)
    return {
      success: false,
      error: "An unexpected error occurred while updating status.",
    }
  }
}
