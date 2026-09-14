// lib/actions/authentication/handleCallback.ts
"use server"

/**
 * @file Server Action to handle the final step of an OAuth 2.0 flow.
 * This action is called by the callback page after a user successfully authenticates
 * with an external provider (like Google) and is redirected back to the application.
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

/**
 * Exchanges an authorization code for a user session with Supabase.
 * @param code The authorization code provided by the OAuth provider.
 * @returns An `ApiResult` indicating success or failure.
 */
export async function handleCallback(code: string): Promise<ApiResult<null>> {
  try {
    // 1. Create a Supabase client instance for server-side operations.
    const supabase = await createServerClient()

    // 2. Exchange the received authorization code for a user session.
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    // 3. If the exchange fails, log the error and return a failure result.
    if (error) {
      console.error("Callback Session Error:", error)
      return { success: false, error: "SESSION_EXCHANGE_FAILED" }
    }

    // 4. If successful, return a success result.
    return { success: true, data: null }
  } catch (error) {
    // 5. Catch any unexpected errors during the process.
    console.error("Unexpected error in handleCallback:", error)
    return { success: false, error: "UNEXPECTED_ERROR" }
  }
}
