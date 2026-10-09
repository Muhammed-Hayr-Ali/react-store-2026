"use server"

import { cache } from "react"
import { createServerClient } from "@/lib/database/supabase/server"
import { AppPermission } from "./types"

export const hasPermission = cache(
  async (permission: AppPermission | AppPermission[]): Promise<boolean> => {
    const permissions = Array.isArray(permission) ? permission : [permission]

    if (permissions.length === 0) return false

    const supabase = await createServerClient()

    const results = await Promise.all(
      permissions.map(async (p) => {
        const { data, error } = await supabase.rpc("check_user_permission", {
          p_permission: p,
        })

        if (error) return false
        return Boolean(data)
      })
    )

    return results.some(Boolean)
  }
)
