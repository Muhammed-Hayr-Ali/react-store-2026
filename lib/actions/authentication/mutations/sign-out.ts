/**
 * @file lib/actions/authentication/mutations/sign-out.ts
 * @description Terminates the active user session and clears authentication cookies.
 */

"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/actions/types/utils"

export async function signOut(): Promise<ApiResult<null>> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: "SIGN_OUT_USER_ERROR",
        details: { auth: [error.message] },
      }
    }

    const cookieStore = await cookies()
    cookieStore.delete("login_method")

    revalidatePath("/", "layout")

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: "SIGN_OUT_USER_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}