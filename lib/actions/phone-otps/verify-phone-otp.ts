/**
 * @file lib/actions/phone-otps/verify-phone-otp.ts
 * @description Verifies the phone OTP code against database records using schemas.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { getValidationDetails } from "../validation"
import { verifyOtpSchema, type VerifyOtpFormValues } from "./schemas"

export async function verifyPhoneOtp(
  input: VerifyOtpFormValues
): Promise<ApiResult<{ phoneNumber: string }>> {
  const validation = verifyOtpSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { phone, code } = validation.data

  // remove any spaces or non-digit characters from the phone number for consistency
  const cleanDigits = phone.replace(/[^0-9]/g, "")

  console.log(
    "Verifying OTP for phone number:",
    cleanDigits,
    "with code:",
    code
  )

  const supabase = await createServerClient()

  const { data: record, error: fetchError } = await supabase
    .from("phone_otps")
    .select("*")
    .eq("phone_number", cleanDigits)
    .eq("code", code)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !record) {
    return { success: false, error: "INVALID_OR_EXPIRED_OTP" }
  }

  const { error: updateError } = await supabase
    .from("phone_otps")
    .update({ used: true })
    .eq("id", record.id)

  if (updateError) {
    console.error("Database update error:", updateError)
    return { success: false, error: "VERIFICATION_UPDATE_FAILED" }
  }

  return {
    success: true,
    data: { phoneNumber: record.phone_number },
  }
}
