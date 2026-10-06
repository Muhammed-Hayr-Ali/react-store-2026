"use server"

import { cache } from "react"
import { createServerClient } from "@/lib/database/supabase/server"
import { AppPermission } from "./types"


export const hasPermission = cache(
  async (permission: AppPermission): Promise<boolean> => {
    const supabase = await createServerClient()
    const { data, error } = await supabase.rpc("check_user_permission", {
      p_permission: permission,
    })

    if (error) return false
    return Boolean(data)
  }
)
