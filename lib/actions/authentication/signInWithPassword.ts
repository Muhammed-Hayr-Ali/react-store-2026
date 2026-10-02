"use server"

/**
 * @file Server Action for handling user sign-in with email and password.
 */

import { cookies } from "next/headers"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

/**
 * Attempts to sign in a user using their email and password.
 * @param email The user's email address.
 * @param password The user's password.
 * @returns An `ApiResult` indicating success or failure.
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<ApiResult<null>> {
  // 1. Create a Supabase client for server-side authentication.
  const supabase = await createServerClient()

  // 2. Attempt to sign in with the provided credentials.
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // 3. If an error occurs, log it and return a failure result.
  if (error) {
    return {
      success: false,
      error: error.message || "USER_SIGNIN_ERROR",
    }
  }

  // 4. If successful, set the cookie to indicate the user is authenticated.
  const cookieStore = await cookies()
  cookieStore.set("login_method", "email")

  // 5. On success, return a success result.
  return { success: true, data: null }
}
