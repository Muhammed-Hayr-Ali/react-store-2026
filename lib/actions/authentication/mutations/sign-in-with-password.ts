/**
 * @file lib/actions/authentication/mutations/sign-in-with-password.ts
 * @description Authenticates a user using email and password credentials.
 */

"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { signInWithPasswordSchema } from "../schemas"

/**
 * تسجل دخول المستخدم بالبريد الإلكتروني وكلمة المرور.
 */
export async function signInWithPassword(
  input: unknown
): Promise<ApiResult<null>> {
  const validation = signInWithPasswordSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { email, password } = validation.data

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const errorCode = error.message.includes("Invalid login credentials")
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
