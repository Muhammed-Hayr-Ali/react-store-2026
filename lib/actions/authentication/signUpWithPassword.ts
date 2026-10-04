"use server"

import React from "react"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { sendEmail } from "@/lib/services/email/send-email"
import WelcomeEmail from "@/lib/services/email/templates/welcome-email"
import { appRoutes } from "@/lib/config/app-routes"
import { signUpWithPasswordSchema } from "./schemas"
import { SignUpWithPasswordInput } from "./types"

export async function signUpWithPassword(
  input: SignUpWithPasswordInput
): Promise<ApiResult<null>> {
  const validation = signUpWithPasswordSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validation.data
  const supabase = await createServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message || "USER_SIGNUP_ERROR",
    }
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    await sendEmail({
      to: email,
      subject: "مرحباً بك في Marketna",
      reactComponent: React.createElement(WelcomeEmail, {
        userName: name || "عميلنا العزيز",
        loginUrl: `${baseUrl}${appRoutes.auth.login}`,
      }),
    })
  } catch (emailError) {
    console.error("Non-blocking email delivery failure:", emailError)
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
