"use server"

import { getMfaFactors, verifyMfa } from "@/lib/actions/mfa/mfa"

// ===============================================================================
// File Name: verify-mfa-actions.ts
// Description: Verify MFA  Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-03-16
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Api Response Type
// ================================================================================
export type ApiResponse<T> = {
  data?: T
  error?: string
  [key: string]: unknown
}

// ===============================================================================
// Verify MFA For Login
// ===============================================================================
export async function verifyMfaForLogin(
  code: string
): Promise<ApiResponse<boolean>> {
  // Create a new server client

  // Get the MFA factors
  const { data: factor, error } = await getMfaFactors()

  // Check for errors
  if (error || !factor || !factor.id) {
    console.error("MFA Verify Step 2 Error (getMfaFactors):", "No factor found")
    return { error: "MFA_VERIFY_FAILED" }
  }

  // Get the TOTP factor ID
  const totpFactorId = factor.id

  // Verify the MFA code
  const { data: verifyData, error: verifyError } = await verifyMfa(
    totpFactorId,
    code
  )

  // Check for errors
  if (verifyError || !verifyData) {
    console.error("MFA Verify Step 2 Error (verifyMfa):", verifyError)
    return { error: "MFA_VERIFY_FAILED" }
  }



  return { data: true }
}
