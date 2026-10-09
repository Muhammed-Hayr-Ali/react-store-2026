/**
 * @file lib/actions/authentication/mutations/sign-up-with-password.ts
 * @description Registers a new user account with email and password credentials.
 */

"use server"

import React from "react"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { sendEmail } from "@/lib/services/email/send-email"
import WelcomeEmail from "@/lib/services/email/templates/welcome-email"
import { appRoutes } from "@/lib/config/app-routes"
import { signUpWithPasswordSchema } from "../schemas"
import { ApiResult } from "../types"

export async function signUpWithPassword(
  payload: unknown
): Promise<ApiResult<null>> {
  // Step 1: Input Validation
  const validation = signUpWithPasswordSchema.safeParse(payload)
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

  const { name, email, password } = validation.data

  // Step 2: Client Initialization
  const supabase = await createServerClient()

  // Step 3: Auth Signup Operation
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    const errorCode =
      error.message.includes("User already registered") || error.status === 422
        ? "EMAIL_ALREADY_EXISTS"
        : "SIGN_UP_USER_ERROR"

    return {
      success: false,
      error: errorCode,
      details: { auth: [error.message] },
    }
  }

  // Step 4: Non-blocking Notification Dispatch
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    await sendEmail({
      to: email,
      subject: "مرحباً بك في Marketna",
      reactComponent: React.createElement(WelcomeEmail, {
        userName: name,
        loginUrl: `${baseUrl}${appRoutes.auth.login}`,
      }),
    })
  } catch (emailError) {
    console.error("Non-blocking email delivery error:", emailError)
  }

  // Step 5: Cookie Management
  const cookieStore = await cookies()
  cookieStore.set("login_method", "email", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  // Step 6: Global Layout Invalidation
  revalidatePath("/", "layout")

  return { success: true, data: null }
}