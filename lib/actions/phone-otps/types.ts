/**
 * @file lib/actions/phone-otps/types.ts
 * @description Type definitions for phone OTP verification operations.
 */

export interface PhoneOtpRecord {
  id: string
  phone_number: string
  code: string
  expires_at: string
  used: boolean
  created_at: string
}