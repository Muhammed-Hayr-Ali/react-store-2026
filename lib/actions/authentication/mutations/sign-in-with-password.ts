/**
 * @file lib/actions/authentication/mutations/sign-in-with-password.ts
 * @description Authenticates a user using email and password credentials.
 */

"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { signInWithPasswordSchema } from "../schemas"
import { ApiResult } from "../types"

export async function signInWithPassword(
  payload: unknown
): Promise<ApiResult<null>> {
  // Step 1: Input Validation
  const validation = signInWithPasswordSchema.safeParse(payload)
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

  const { email, password } = validation.data

  // Step 2: Client Initialization
  const supabase = await createServerClient()

  // Step 3: Auth Execution
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const errorCode =
      error.message.includes("Invalid login credentials")
        ? "INVALID_CREDENTIALS"
        : error.message.includes("Email not confirmed")
          ? "EMAIL_NOT_CONFIRMED"
          : "SIGN_IN_USER_ERROR"

    return {
      success: false,
      error: errorCode,
      details: { auth: [error.message] },
    }
  }

  // Step 4: Cookie Tracking
  const cookieStore = await cookies()
  cookieStore.set("login_method", "email", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  // Step 5: Global Layout Invalidation
  revalidatePath("/", "layout")

  return { success: true, data: null }
}