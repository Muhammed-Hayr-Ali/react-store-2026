/**
 * @file lib/actions/authentication/mutations/sign-up-with-password.ts
 * @description Registers a new user account with email and password credentials.
 */

"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import React from "react"

import type { ApiResult } from "@/lib/actions/types/utils"
import { appRoutes } from "@/lib/config/app-routes"
import { createServerClient } from "@/lib/database/supabase/server"
import { sendEmail } from "@/lib/services/email/send-email"
import WelcomeEmail from "@/lib/services/email/templates/welcome-email"

import { getValidationDetails } from "../../validation"
import { signUpWithPasswordSchema } from "../schemas"

export async function signUpWithPassword(
  input: unknown
): Promise<ApiResult<null>> {
  const validation = signUpWithPasswordSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { firstName, lastName, email, password } = validation.data

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
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

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    await sendEmail({
      to: email,
      subject: "مرحباً بك في Marketna",
      reactComponent: React.createElement(WelcomeEmail, {
        userName: `${firstName} ${lastName}`,
        loginUrl: `${baseUrl}${appRoutes.auth.login}`,
      }),
    })
  } catch (emailError) {
    console.error("Non-blocking email delivery error:", emailError)
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
