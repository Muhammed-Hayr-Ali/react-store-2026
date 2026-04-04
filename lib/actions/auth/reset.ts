"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/database/supabase/server"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { sendPasswordResetEmail } from "@/lib/email"
import type { ApiResult } from "@/lib/database/types"

// =====================================================
// 🔑 Password Reset — Server Actions
// =====================================================

const ResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type ResetRequestInput = z.infer<typeof ResetRequestSchema>

/**
 * Get client IP address (for audit)
 */
async function getClientIP(): Promise<string | null> {
  try {
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const forwarded = headersList.get("x-forwarded-for")
    if (forwarded) return forwarded.split(",")[0].trim()
    const realIp = headersList.get("x-real-ip")
    if (realIp) return realIp.trim()
    return null
  } catch {
    return null
  }
}

/**
 * Request password reset
 *
 * - Looks up user in core_profile
 * - Creates reset token via DB function
 * - Sends email with reset link + code
 * - Always returns success (don't reveal if email exists)
 */
export async function requestPasswordReset(
  input: ResetRequestInput
): Promise<ApiResult> {
  const parsed = ResetRequestSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  // 1. Find user
  const { data: profile } = (await supabase
    .from("core_profile")
    .select("id, first_name, last_name, email")
    .eq("email", parsed.data.email)
    .single()) as {
    data: {
      id: string
      first_name: string | null
      last_name: string | null
      email: string
    } | null
  }

  // Don't reveal if email exists — always return success
  if (!profile) {
    return { success: true }
  }

  // 2. Get client IP
  const clientIP = await getClientIP()

  // 3. Create token via DB function
  const { data: tokenData, error: tokenError } = await supabase.rpc(
    "create_password_reset_token",
    {
      p_profile_id: profile.id,
      p_email: profile.email,
      p_expires_in_minutes: 60,
      p_ip_address: clientIP,
    } as never
  )

  if (tokenError || !tokenData) {
    console.error("Failed to create reset token:", tokenError)
    // Fall back: send email via Supabase native reset
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${appUrl}/reset-password`,
    })
    return { success: true }
  }

  const token = tokenData as string
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  // 4. Send email (no short code — link is sufficient)
  const fullName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "User"

  try {
    await sendPasswordResetEmail(parsed.data.email, fullName, resetUrl)
  } catch (emailError) {
    console.error("Failed to send reset email:", emailError)
    // Token was created — email failure is non-fatal
  }

  return { success: true }
}

// =====================================================
// 🔄 Reset Password — Use Token (Atomic Claim)
// =====================================================

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

/**
 * Reset password using token
 *
 * - Validates input via Zod
 * - Atomically claims token via DB function
 * - Updates password via Supabase Auth admin API
 * - Redirects to sign-in on success
 */
export async function resetPassword(
  input: ResetPasswordInput,
  token: string
): Promise<ApiResult> {
  // 1. Validate input
  const parsed = ResetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  if (!token || token.trim().length === 0) {
    return { success: false, error: "AUTH_INVALID_TOKEN" }
  }

  const supabase = await createClient()

  // 2. Atomically claim the token
  const { data: claimData, error: claimError } = await supabase.rpc(
    "claim_password_reset_token",
    { p_token: token.trim() } as never
  )

  const result = claimData as unknown as Array<{
    is_valid: boolean
    profile_id: string
    email: string
    message: string
  }>

  if (claimError || !result?.[0]?.is_valid) {
    return {
      success: false,
      error: result?.[0]?.message ?? "AUTH_INVALID_TOKEN",
    }
  }

  const claimedProfileId = result[0].profile_id

  // 3. Update password via Supabase Auth Admin API (requires service_role)
  const supabaseAdmin = createAdminClient()
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    claimedProfileId,
    { password: parsed.data.password }
  )

  if (updateError) {
    console.error("Failed to update password:", updateError)
    return { success: false, error: "AUTH_PASSWORD_UPDATE_ERROR" }
  }

  // 4. Redirect to sign-in
  redirect("/sign-in?reset=success")
}

// =====================================================
// 🔍 Verify Token (For Display Only — NOT for Security)
// =====================================================

/**
 * Check if a reset token is valid WITHOUT consuming it.
 * ⚠️ Use ONLY for displaying status to user.
 * For actual password reset, use resetPassword() which calls claim().
 */
export async function verifyResetToken(
  token: string
): Promise<{ isValid: boolean; email?: string; expiresAt?: string }> {
  if (!token || token.trim().length === 0) {
    return { isValid: false }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("verify_password_reset_token", {
      p_token: token.trim(),
    } as never)

    const verifyResult = data as unknown as Array<{
      is_valid: boolean
      email: string
      expires_at: string
    }>

    if (error || !verifyResult?.[0]?.is_valid) {
      return { isValid: false }
    }

    return {
      isValid: true,
      email: verifyResult[0].email,
      expiresAt: verifyResult[0].expires_at,
    }
  } catch {
    return { isValid: false }
  }
}
