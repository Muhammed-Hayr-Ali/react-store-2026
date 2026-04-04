"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/database/supabase/server"
import type { ApiResult, UUID } from "@/lib/database/types"

// =====================================================
// ✅ Schema Validation
// =====================================================

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
})

export type LoginInput = z.infer<typeof LoginSchema>

// =====================================================
// 📝 Login Action
// =====================================================

export async function login(
  input: LoginInput
): Promise<ApiResult<{ accessToken?: string; refreshToken?: string }>> {
  // 1. Validate input
  const parsed = LoginSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  // 2. Attempt sign in
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    })

  if (authError) {
    const message = authError.message.includes("Invalid login credentials")
      ? "AUTH_INVALID_CREDENTIALS"
      : authError.message.includes("Email not confirmed")
        ? "AUTH_EMAIL_NOT_CONFIRMED"
        : "AUTH_SIGN_IN_ERROR"

    return { success: false, error: message }
  }

  if (!authData.user) {
    return { success: false, error: "AUTH_SIGN_IN_ERROR" }
  }

  // 3. Verify profile — create if missing
  const { data: profile } = await supabase
    .from("core_profile")
    .select("id, deleted_at")
    .eq("id", authData.user.id as UUID)
    .single()

  // Profile doesn't exist — create it
  if (!profile) {
    try {
      await supabase.from("core_profile").insert({
        id: authData.user.id,
        email: authData.user.email ?? "",
        first_name: (authData.user.user_metadata?.first_name as string) ?? "",
        last_name: (authData.user.user_metadata?.last_name as string) ?? "",
        avatar_url: (authData.user.user_metadata?.avatar_url as string) ?? null,
        is_phone_verified: false,
        preferred_language: "ar",
        timezone: "Asia/Riyadh",
      } as never)
    } catch {
      // Ignore — might be a duplicate from trigger race
    }

    // Auto-assign "customer" role
    try {
      const { data: role } = await supabase
        .from("core_role")
        .select("id")
        .eq("code", "customer")
        .single()

      if (role) {
        await supabase.from("core_profile_role").insert({
          profile_id: authData.user.id,
          role_id: (role as { id: string }).id,
        } as never)
      }
    } catch {
      // Ignore — role might not exist yet
    }
  } else {
    // Profile exists — check if soft-deleted
    if ((profile as { deleted_at: string | null }).deleted_at) {
      await supabase.auth.signOut()
      return { success: false, error: "AUTH_ACCOUNT_DELETED" }
    }
  }

  // 4. Revalidate & return success (session is set on server)
  revalidatePath("/", "layout")
  return {
    success: true,
    data: {
      accessToken: authData.session?.access_token,
      refreshToken: authData.session?.refresh_token,
    },
  }
}

// =====================================================
// 🚪 Logout Action
// =====================================================

export async function logout(): Promise<ApiResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: "AUTH_SIGN_OUT_ERROR" }
  }

  revalidatePath("/", "layout")
  redirect("/sign-in")
  // unreachable — but TypeScript needs this
  return { success: true }
}

// =====================================================
// 🔑 Request Password Reset
// =====================================================

const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

export async function requestPasswordReset(
  input: ResetPasswordInput
): Promise<ApiResult> {
  const parsed = ResetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    }
  )

  if (error) {
    return { success: false, error: "AUTH_RESET_ERROR" }
  }

  return { success: true }
}

// =====================================================
// 🔐 Update Password
// =====================================================

const UpdatePasswordSchema = z
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

export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>

export async function updatePassword(
  input: UpdatePasswordInput
): Promise<ApiResult> {
  const parsed = UpdatePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { success: false, error: "AUTH_PASSWORD_UPDATE_ERROR" }
  }

  revalidatePath("/", "layout")
  redirect("/")
  // unreachable
  return { success: true }
}
