"use server"

import { createServerClient } from "@/lib/database/supabase/server"

export type Role = "admin" | "customer" | "vendor" | "moderator"

/**
 * ✅ 1. التحقق من دور المستخدم عبر RPC (الأكثر أماناً وسرعة)
 * يستخدم auth.uid() داخلياً في PostgreSQL
 */
export async function hasRole(roleName: string): Promise<boolean> {
  const supabase = await createServerClient()

  const { data: hasRole, error } = await supabase.rpc("check_user_role", {
    p_role_name: roleName,
  })

  console.log({ hasRole, error })

  if (error) {
    return  false
  }

  return  hasRole as boolean 
}
