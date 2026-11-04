/**
 * @file lib/actions/phone-otps/index.ts
 * @description Centralized export point for phone OTP actions, schemas, and types.
 */

// Actions
export { sendPhoneOtp } from "./send-phone-otp"
export { verifyPhoneOtp } from "./verify-phone-otp"

// Schemas & Types
export * from "./schemas"
export * from "./types"
