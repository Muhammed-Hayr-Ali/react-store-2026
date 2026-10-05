"use server"

import { createClient } from "@/lib/database/supabase/server"
import { UserStatus } from "../types"

interface CurrentUserStatusResult {
  isAuthenticated: boolean
  status: UserStatus | null
  banReason: string | null
}

export async function getCurrentUserStatus(): Promise<CurrentUserStatusResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { isAuthenticated: false, status: null, banReason: null }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("status, ban_reason")
      .eq("id", user.id)
      .single()

    return {
      isAuthenticated: true,
      status: (profile?.status as UserStatus) || "active",
      banReason: profile?.ban_reason || null,
    }
  } catch (error) {
    console.error("Error checking user status:", error)
    return { isAuthenticated: false, status: null, banReason: null }
  }
}
