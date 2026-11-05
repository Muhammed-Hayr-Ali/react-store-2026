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
import { resolveEmailLocale } from "@/lib/services/email/locale"
import WelcomeEmail from "@/lib/services/email/templates/welcome-email"

import { getValidationDetails } from "../../validation"
import { signUpWithPasswordSchema } from "../schemas"
import { createOpenWAClient } from "@/lib/openwa/openWAClient"

/**
 * تنشئ حسابًا جديدًا بالبريد الإلكتروني وكلمة المرور.
 */
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

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    phone_verified,
    locale,
  } = validation.data

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        phone_verified: phone_verified,
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
    const emailLocale = resolveEmailLocale(locale)
    await sendEmail({
      to: email,
      subject:
        emailLocale === "ar"
          ? "أهلاً بك في عائلة Marketna! 🎉"
          : "Welcome to the Marketna family! 🎉",
      reactComponent: React.createElement(WelcomeEmail, {
        locale: emailLocale,
        userName: `${firstName} ${lastName}`,
        loginUrl: `${baseUrl}${appRoutes.auth.login}`,
      }),
    })
  } catch (emailError) {
    console.error("Non-blocking email delivery error:", emailError)
  }

  if (phone && phone_verified) {
    const sessionId = process.env.OPENWA_SESSION_ID
    if (!sessionId) {
      console.error("WhatsApp session ID is not configured.")
      return { success: false, error: "WHATSAPP_SESSION_NOT_CONFIGURED" }
    }

    const messageText =
      locale === "ar"
        ? `مرحبًا ${firstName} ${lastName}! شكرًا لانضمامك إلى Marketna. نحن متحمسون لمساعدتك في اكتشاف أفضل العروض وإدارة طلباتك بسهولة.`
        : `Hello ${firstName} ${lastName}! Thank you for joining Marketna. We're excited to help you discover the best deals and manage your orders with ease.`

    try {
      const openWA = createOpenWAClient()
      await openWA.messages.sendText(sessionId, {
        chatId: `${phone.replace(/[^0-9]/g, "")}@c.us`,
        text: messageText,
      })
    } catch (whatsappError) {
      console.error("Non-blocking WhatsApp delivery error:", whatsappError)
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
