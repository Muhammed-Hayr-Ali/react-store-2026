/**
 * @file lib/actions/authentication/mutations/sign-in-with-password.ts
 * @description Authenticates a user using email and password credentials.
 */

"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { signInWithPasswordSchema } from "../schemas"
import { ApiResult } from "@/lib/actions/types/utils"

export async function signInWithPassword(
  input: unknown
): Promise<ApiResult<null>> {
  const validation = signInWithPasswordSchema.safeParse(input)
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

  const supabase = await createServerClient()

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

  const cookieStore = await cookies()
  cookieStore.set("login_method", "email", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  revalidatePath("/", "layout")

  return { success: true, data: null }
}