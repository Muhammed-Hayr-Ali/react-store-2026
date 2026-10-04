"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { oauthCallbackSchema } from "./schemas"

export async function handleCallback(code: string): Promise<ApiResult<null>> {
  const validation = oauthCallbackSchema.safeParse({ code })
  if (!validation.success) {
    return {
      success: false,
      error: "INVALID_AUTH_CODE",
    }
  }

  try {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(
      validation.data.code
    )

    if (error) {
      console.error("Callback Session Error:", error.message)
      return { success: false, error: "SESSION_EXCHANGE_FAILED" }
    }

    revalidatePath("/", "layout")
    return { success: true, data: null }
  } catch (error) {
    console.error("Unexpected error in handleCallback:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
