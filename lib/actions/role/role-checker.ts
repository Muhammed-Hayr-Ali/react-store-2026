"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { AppRole } from "./types"

export async function hasRole(roleName: AppRole): Promise<boolean> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("check_user_role", {
    p_role_name: roleName,
  })

  if (error) return false
  return Boolean(data)
}
