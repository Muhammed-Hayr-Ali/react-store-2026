"use server"

import { createServerClient } from "@/lib/database/supabase/server";
import { ApiResult } from "@/lib/database/types/utils";


export async function signOut(): Promise<ApiResult<null>> {
  // 1. Create a Supabase client for server-side authentication.
  const supabase = await createServerClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      success: false,
      error: error.message || "USER_SIGNIN_ERROR",
    }
  }

  return { success: true, data: null }
}