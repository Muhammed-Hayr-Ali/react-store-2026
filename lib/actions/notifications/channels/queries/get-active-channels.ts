/**
 * @file lib/actions/notifications/channels/queries/get-active-channels.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord } from "../../types"

interface DatabaseOperationResult<T> {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

function isNetworkError(error: unknown): boolean {
  if (!error) return false
  if (typeof error === "object" && error !== null) {
    const err = error as { message?: string; cause?: { code?: string } }
    if (typeof err.message === "string") {
      if (
        err.message.includes("fetch failed") ||
        err.message.includes("ECONNRESET")
      ) {
        return true
      }
    }
    if (err.cause?.code === "ECONNRESET") {
      return true
    }
  }
  return false
}

async function fetchWithRetry<T>(
  fn: () => Promise<DatabaseOperationResult<T>>,
  retries = 3,
  delayMs = 500
): Promise<DatabaseOperationResult<T>> {
  let lastError: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fn()
      if (!res.error) return res

      if (isNetworkError(res.error)) {
        lastError = res.error
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
          continue
        }
      }
      return res
    } catch (err: unknown) {
      if (isNetworkError(err) && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
        continue
      }

      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Unknown network error",
          code: "NETWORK_ERROR",
        },
      }
    }
  }

  return { data: null, error: lastError }
}

/**
 * جلب كافة القنوات (النشطة والمعطلة) للوحة تحكم الإدارة
 */
export async function getAllNotificationChannels(): Promise<
  ApiResult<NotificationChannelRecord[]>
> {
  const supabase = await createServerClient()

  const { data, error } = await fetchWithRetry<NotificationChannelRecord[]>(
    async () => {
      const res = await supabase
        .from("notification_channels")
        .select("*")
        .order("is_mandatory", { ascending: false })
        .order("created_at", { ascending: false })

      return {
        data: res.data as NotificationChannelRecord[] | null,
        error: res.error,
      }
    }
  )

  if (error) {
    return {
      success: false,
      error: "FETCH_CHANNELS_ERROR",
      details: { database: [error.message || "Network connection reset"] },
    }
  }

  return { success: true, data: data ?? [] }
}

/**
 * جلب القنوات النشطة فقط للاشتراكات والواجهة العامة
 */
export async function getActiveNotificationChannels(): Promise<
  ApiResult<NotificationChannelRecord[]>
> {
  const supabase = await createServerClient()

  const { data, error } = await fetchWithRetry<NotificationChannelRecord[]>(
    async () => {
      const res = await supabase
        .from("notification_channels")
        .select("*")
        .eq("is_active", true)
        .order("is_mandatory", { ascending: false })
        .order("name", { ascending: true })

      return {
        data: res.data as NotificationChannelRecord[] | null,
        error: res.error,
      }
    }
  )

  if (error) {
    return {
      success: false,
      error: "FETCH_CHANNELS_ERROR",
      details: { database: [error.message || "Network connection reset"] },
    }
  }

  return { success: true, data: data ?? [] }
}
