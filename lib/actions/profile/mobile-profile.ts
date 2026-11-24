"use server"

import { z } from "zod"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createAdminClient } from "@/lib/database/supabase/admin"

export interface MobileProfileData {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  gender: "male" | "female" | "other" | null
  email_verified: boolean
  phone_verified: boolean
}

const updateMobileProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().max(100).nullable().optional(),
  phone: z.string().trim().min(6).max(25).nullable().optional(),
  avatar: z.string().trim().url().nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
})

const PROFILE_COLUMNS =
  "id, first_name, last_name, email, phone, avatar, gender, email_verified, phone_verified"

/**
 * يستخرج معرّف المستخدم الحالي من Access Token القادم من تطبيق Flutter.
 */
async function resolveUserIdFromToken(
  accessToken: string
): Promise<string | null> {
  if (!accessToken.trim()) return null

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken)

  if (error || !data.user) {
    return null
  }

  return data.user.id
}

/**
 * قراءة بيانات الملف الشخصي للمستخدم المصادق عليه.
 */
export async function getMobileProfile(
  accessToken: string
): Promise<ApiResult<MobileProfileData>> {
  try {
    const userId = await resolveUserIdFromToken(accessToken)
    if (!userId) {
      return { success: false, error: "UNAUTHORIZED" }
    }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: "PROFILE_NOT_FOUND",
        details: error ? { database: [error.message] } : undefined,
      }
    }

    return {
      success: true,
      data: {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        gender: data.gender as MobileProfileData["gender"],
        email_verified: Boolean(data.email_verified),
        phone_verified: Boolean(data.phone_verified),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "FETCH_PROFILE_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}

/**
 * تحديث بيانات الملف الشخصي في جدول public.profiles.
 */
export async function updateMobileProfile(
  accessToken: string,
  input: unknown
): Promise<ApiResult<MobileProfileData>> {
  const parsed = updateMobileProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
    }
  }

  try {
    const userId = await resolveUserIdFromToken(accessToken)
    if (!userId) {
      return { success: false, error: "UNAUTHORIZED" }
    }

    const supabaseAdmin = createAdminClient()
    const payload = parsed.data

    const updateFields: Record<string, unknown> = {
      first_name: payload.first_name,
      updated_at: new Date().toISOString(),
    }

    if ("last_name" in payload) {
      updateFields.last_name = payload.last_name ?? null
    }
    if ("phone" in payload) {
      updateFields.phone = payload.phone ?? null
    }
    if ("avatar" in payload) {
      updateFields.avatar = payload.avatar ?? null
    }
    if ("gender" in payload) {
      updateFields.gender = payload.gender ?? null
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updateFields)
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single()

    if (error || !data) {
      // معالجة تكرار رقم الهاتف (عمود phone يحمل قيد UNIQUE)
      if (error?.code === "23505") {
        return {
          success: false,
          error: "PHONE_ALREADY_IN_USE",
        }
      }

      return {
        success: false,
        error: "UPDATE_PROFILE_ERROR",
        details: error ? { database: [error.message] } : undefined,
      }
    }

    return {
      success: true,
      data: {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        gender: data.gender as MobileProfileData["gender"],
        email_verified: Boolean(data.email_verified),
        phone_verified: Boolean(data.phone_verified),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "UPDATE_PROFILE_ERROR",
      details: {
        system: [error instanceof Error ? error.message : "Unknown error"],
      },
    }
  }
}