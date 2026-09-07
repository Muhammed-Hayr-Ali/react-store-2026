"use server"

/**
 * @file Server Action for handling new user sign-up with email and password.
 */

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { sendEmail } from "@/lib/services/email/send-email"
import WelcomeEmail from "@/lib/services/email/templates/welcome-email"
import { cookies } from "next/headers"
import React from "react"

/**
 * Signs up a new user with their name, email, and password.
 * Sends a welcome email upon successful registration.
 * @param name The user's full name.
 * @param email The user's email address.
 * @param password The user's chosen password.
 * @returns An `ApiResult` indicating success or failure.
 */
export async function signUpWithPassword(
  name: string,
  email: string,
  password: string
): Promise<ApiResult<null>> {
  // initialize cookies
  const cookieStore = await cookies()

  // 1. Create a Supabase client for server-side operations.
  const supabase = await createServerClient()

  // 2. Attempt to sign up the new user with the provided details.
  // The user's name is passed in the `options.data` to be stored in `auth.users.raw_user_meta_data`.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  // 3. If sign-up fails, log the error and return a failure result.
  if (error) {
    return {
      success: false,
      error: error.message || "USER_SIGNUP_ERROR",
    }
  }

  // 4. On successful sign-up, send a welcome email to the user.
  await sendEmail({
    to: email,
    subject: "مرحباً بك في Marketna",
    reactComponent: React.createElement(WelcomeEmail, {
      userName: name || "عميلنا العزيز",
      loginUrl: "https://marketna.com/login",
    }),
  })

  cookieStore.set("login_method", "email")

  // 5. Return a success result.
  return { success: true, data: null }
}
