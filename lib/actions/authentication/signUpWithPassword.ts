"use server"

/**
 * @file Server Action for handling new user sign-up with email and password.
 */

import React from "react"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { sendEmail } from "@/lib/services/email/send-email"
import WelcomeEmail from "@/lib/services/email/templates/welcome-email"

export async function signUpWithPassword(
  name: string,
  email: string,
  password: string
): Promise<ApiResult<null>> {
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

  await sendEmail({
    to: email,
    subject: "مرحباً بك في Marketna",
    reactComponent: React.createElement(WelcomeEmail, {
      userName: name || "عميلنا العزيز",
      loginUrl: "https://marketna.com/login",
    }),
  })

  const cookieStore = await cookies()
  cookieStore.set("login_method", "email")

  return { success: true, data: null }
}
