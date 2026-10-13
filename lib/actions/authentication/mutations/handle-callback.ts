/**
 * @file lib/actions/authentication/mutations/handle-callback.ts
 * @description Exchanges an OAuth authorization code for an active user session.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { oauthCallbackSchema } from "../schemas"
import { ApiResult } from "@/lib/actions/types/utils"

export async function handleCallback(input: unknown): Promise<ApiResult<null>> {
  const validation = oauthCallbackSchema.safeParse(
    typeof input === "string" ? { code: input } : input
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
    const supabase = await createServerClient()

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