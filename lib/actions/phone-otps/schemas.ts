/**
 * @file lib/actions/phone-otps/schemas.ts
 * @description Zod validation schemas and types for phone OTP operations.
 */

import { z } from "zod"

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(8, { message: "Phone number is too short" })
    .max(20, { message: "Phone number is too long" }),
})

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(8, { message: "Phone number is required" }),
  code: z
    .string()
    .length(6, { message: "Verification code must be exactly 6 digits" }),
})

export type SendOtpFormValues = z.infer<typeof sendOtpSchema>
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>

export interface PhoneOtpRecord {
  id: string
  phone_number: string
  code: string
  expires_at: string
  used: boolean
  created_at: string
}