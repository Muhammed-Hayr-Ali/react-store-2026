"use server"

import { createServerClient } from "@/lib/database/supabase/server"


export async function hasPermission(permission: string): Promise<boolean> {
  const supabase = await createServerClient()

  const { data: hasPerm, error } = await supabase.rpc("check_user_permission", {
    p_permission: permission,
  })

  if (error) {
    return false
  }


  return  hasPerm as boolean 
}
