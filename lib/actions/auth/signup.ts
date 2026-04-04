"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/database/types"

// =====================================================
// ✅ Schema Validation
// =====================================================

const SignupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    phone_number: z.string().optional().default(""),
    accept_terms: z.boolean().refine((v) => v, "You must accept the terms"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignupInput = z.infer<typeof SignupSchema>

// =====================================================
// 📝 Signup Action
// =====================================================

export async function signup(
  input: SignupInput
): Promise<ApiResult<{ needsEmailVerification: boolean }>> {
  // 1. Validate input
  const parsed = SignupSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const { email, password, first_name, last_name, phone_number } = parsed.data
  const supabase = await createClient()

  // 2. Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        phone_number,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (authError) {
    const message = authError.message.includes("already registered")
      ? "AUTH_EMAIL_EXISTS"
      : "AUTH_SIGN_UP_ERROR"

    return { success: false, error: message }
  }

  if (!authData.user) {
    return { success: false, error: "AUTH_SIGN_UP_ERROR" }
  }

  // 3. Create profile in core_profile
  const { error: profileError } = await supabase.from("core_profile").insert({
    id: authData.user.id,
    email,
    first_name,
    last_name,
    phone_number: phone_number || null,
    avatar_url: null,
    is_phone_verified: false,
    preferred_language: "ar",
    timezone: "Asia/Riyadh",
  } as never)

  if (
    profileError &&
    !profileError.message?.includes("duplicate") &&
    profileError.code !== "23505"
  ) {
    console.error("Profile creation error:", profileError)
  }

  // 4. Check if email verification is required
  const needsVerification = !authData.session

  if (needsVerification) {
    return {
      success: true,
      data: { needsEmailVerification: true },
    }
  }

  // 5. Success — redirect to dashboard
  revalidatePath("/", "layout")
  redirect("/")
}

// =====================================================
// 📧 Resend Verification Email
// =====================================================

const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>

export async function resendVerificationEmail(
  input: ResendVerificationInput
): Promise<ApiResult> {
  const parsed = ResendVerificationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: "AUTH_RESEND_ERROR" }
  }

  return { success: true }
}
