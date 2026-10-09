/**
 * @file lib/actions/authentication/mutations/handle-callback.ts
 * @description Exchanges an OAuth authorization code for an active user session.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { oauthCallbackSchema } from "../schemas"
import { ApiResult } from "../types"

export async function handleCallback(payload: unknown): Promise<ApiResult<null>> {
  // Step 1: Input Validation
  const validation = oauthCallbackSchema.safeParse(
    typeof payload === "string" ? { code: payload } : payload
  )

  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: fieldErrors,
    }
  }

  try {
    // Step 2: Client Initialization
    const supabase = await createServerClient()

    // Step 3: Auth Code Exchange
    const { error } = await supabase.auth.exchangeCodeForSession(
      validation.data.code
    )

    if (error) {
      return {
        success: false,
        error: "EXCHANGE_OAUTH_CODE_ERROR",
        details: { auth: [error.message] },
      }
    }

    // Step 4: Layout & Root Tree Revalidation
    revalidatePath("/", "layout")
    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: "HANDLE_OAUTH_CALLBACK_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}