/**
 * @file lib/actions/authentication/mutations/handle-oauth-callback.ts
 * @description Exchanges an OAuth authorization code for an active user session.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import type { OAuthCallbackInput } from "../types"
import { oauthCallbackSchema } from "../schemas"

/**
 * تستبدل رمز OAuth بجلسة مستخدم نشطة.
 */
export async function handleOAuthCallback(
  input: OAuthCallbackInput
): Promise<ApiResult<null>> {
  const validation = oauthCallbackSchema.safeParse(input)

  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
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
