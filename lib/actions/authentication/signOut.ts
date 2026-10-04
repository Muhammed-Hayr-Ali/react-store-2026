"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

export async function signOut(): Promise<ApiResult<null>> {
  // initialize supabase client
  const supabase = await createServerClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      success: false,
      error: error.message || "USER_SIGNOUT_ERROR",
    }
  }

  // clear cache and revalidate the path to ensure the user is logged out
  revalidatePath("/", "layout")

  return { success: true, data: null }
}
