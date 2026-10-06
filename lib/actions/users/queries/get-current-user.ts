/**
 * @file lib/actions/users/queries/get-current-user.ts
 * @description Fetches simplified current user profile, single role, and flat permissions array via Supabase RPC.
 */

"use server"

import { cache } from "react"
import { createServerClient } from "@/lib/database/supabase/server"

export type CurrentUser = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  profile_image: string | null
  gender: "male" | "female" | "other" | null
  status: string | null
  created_at: string | null
  updated_at: string | null
  role: string
  permissions: string[]
}

/**
 * جلب ملخص المستخدم الحالي مع دور منفرد وصلاحيات مسطحة بطلب خادم واحد
 */
export const getCurrentUser = cache(
  async (): Promise<CurrentUser | null> => {
    try {
      const supabase = await createServerClient()

      const { data, error } = await supabase.rpc("get_current_user")

      if (error || !data) {
        return null
      }

      return data as CurrentUser
    } catch {
      return null
    }
  }
)
