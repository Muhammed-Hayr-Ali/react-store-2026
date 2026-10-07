/**
 * @file lib/actions/authentication/signInWithPassword.ts
 */

"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { signInWithPasswordSchema } from "./schemas"
import { SignInWithPasswordInput } from "./types"

export async function signInWithPassword(
  input: SignInWithPasswordInput
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
    return {
      success: false,
      error: error.message || "USER_SIGNIN_ERROR",
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
