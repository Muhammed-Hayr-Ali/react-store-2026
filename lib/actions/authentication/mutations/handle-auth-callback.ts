/**
 * @file lib/actions/authentication/mutations/handle-oauth-callback.ts
 * @description Exchanges an OAuth authorization code for an active user session.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import type { AuthCallbackInput } from "../types"
import { authCallbackSchema } from "../schemas"
import { cookies } from "next/headers"
import {
  APP_CONFIG,
  COOKIES_KEYS,
  LOGIN_METHODS,
} from "@/lib/config/app_config"

/**
 * تستبدل رمز OAuth بجلسة مستخدم نشطة.
 */
export async function handleAuthCallback(
  input: AuthCallbackInput
): Promise<ApiResult<null>> {
  const validation = authCallbackSchema.safeParse(input)

  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

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

  const cookieStore = await cookies()

  cookieStore.set(COOKIES_KEYS.LOGIN_METHOD, LOGIN_METHODS.GOOGLE)

  revalidatePath("/", "layout")
  return { success: true, data: null }
}
