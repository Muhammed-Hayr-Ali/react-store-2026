/**
 * @file lib/actions/authentication/mutations/sign-out.ts
 * @description Terminates the active user session and clears authentication cookies.
 */

"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "../types"

export async function signOut(): Promise<ApiResult<null>> {
  try {
    // Step 1: Client Initialization
    const supabase = await createServerClient()

    // Step 2: Auth Signout Execution
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: "SIGN_OUT_USER_ERROR",
        details: { auth: [error.message] },
      }
    }

    // Step 3: Cookie Cleanup
    const cookieStore = await cookies()
    cookieStore.delete("login_method")

    // Step 4: Cache & Tree Revalidation
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