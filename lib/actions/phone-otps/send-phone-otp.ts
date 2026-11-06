/**
 * @file lib/actions/phone-otps/send-phone-otp.ts
 * @description Generates a phone OTP code, stores it via upsert in database first,
 * then sends it via OpenWA in the user's locale, and returns the formatted phone number.
 */

"use server"

import { getTranslations } from "next-intl/server"
import { createOpenWAClient } from "@/lib/openwa/openWAClient"
import { createServerClient } from "@/lib/database/supabase/server"
import { getValidationDetails } from "../validation"
import { sendOtpSchema, type SendOtpFormValues } from "./schemas"
import type { ApiResult } from "@/lib/actions/types/utils"

export async function sendPhoneOtp(
  input: SendOtpFormValues,
  locale: string = "en"
): Promise<ApiResult<{ phoneNumber: string }>> {
  const validation = sendOtpSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { phone  } = validation.data

  const sessionId = process.env.OPENWA_SESSION_ID
  if (!sessionId) {
    return { success: false, error: "WHATSAPP_SESSION_NOT_CONFIGURED" }
  }

  // Clean the phone number to remove any non-digit characters for consistency
  const cleanDigits = phone.replace(/[^0-9]/g, "")
  // Format the phone number for WhatsApp by appending "@c.us" if not already present
  const formattedPhoneNumber = `${cleanDigits}@c.us`
  // create a random 6-digit verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString()
  // Set the expiration time for the OTP to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const supabase = await createServerClient()

  // Upsert the OTP record in the database to ensure only one active OTP per phone number
  const { error: dbError } = await supabase.from("phone_otps").upsert(
    {
      phone_number: cleanDigits,
      code: verificationCode,
      expires_at: expiresAt,
      used: false,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: "phone_number",
    }
  )

  if (dbError) {
    console.error("Database upsert error:", dbError)
    return { success: false, error: "FAILED_TO_STORE_OTP" }
  }

  // Get the localized message template for WhatsApp
  const t = await getTranslations({ locale, namespace: "PhoneOtp" })
  // format code 123-456
  const formattedCode = verificationCode.replace(/(\d{3})(\d{3})/, "$1-$2")
  // set the message text with the formatted code
  const messageText = t("WHATSAPP_MESSAGE", { code: formattedCode })

  // initialize the OpenWA client and send the message
  const openWA = createOpenWAClient()

  // Send the OTP message via WhatsApp using OpenWA
  const result = await openWA.messages.sendText(sessionId, {
    chatId: formattedPhoneNumber,
    text: messageText,
  })

  if (!result) {
    return { success: false, error: "FAILED_TO_SEND_WHATSAPP_MESSAGE" }
  }

  return {
    success: true,
    data: { phoneNumber: phone },
  }
}
