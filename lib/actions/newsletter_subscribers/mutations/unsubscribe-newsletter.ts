/**
 * @file lib/actions/newsletter_subscribers/mutations/unsubscribe-newsletter.ts
 * @description إلغاء اشتراك عنوان بريد باستخدام رابط آمن.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createAdminClient } from "@/lib/database/supabase/admin"

import { getValidationDetails } from "../../validation"
import { unsubscribeNewsletterSchema } from "../schemas"
import { readNewsletterUnsubscribeToken } from "../unsubscribe-token"

/**
 * تلغي الاشتراك باستخدام رمز صالح وتحفظ أسباب الإلغاء.
 */
export async function unsubscribeNewsletter(
  input: unknown
): Promise<ApiResult<null>> {
  const validation = unsubscribeNewsletterSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  try {
    const payload = readNewsletterUnsubscribeToken(validation.data.token)
    if (!payload) {
      return {
        success: false,
        error: "NEWSLETTER_UNSUBSCRIBE_LINK_EXPIRED",
      }
    }

    const reasons: string[] = validation.data.reasons.filter(
      (reason) => reason !== "OTHER"
    )
    if (validation.data.otherReason) {
      reasons.push(`OTHER: ${validation.data.otherReason}`)
    }
    const unsubscribeReason = reasons.length ? reasons.join(", ") : null

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribe_reason: unsubscribeReason,
      })
      .eq("email", payload.email)
      .eq("status", "active")
      .select("id")
      .maybeSingle()

    if (error) {
      return {
        success: false,
        error: "NEWSLETTER_UNSUBSCRIBE_ERROR",
        details: { database: [error.message] },
      }
    }

    if (data) return { success: true, data: null }

    const { data: subscriber, error: lookupError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("status")
      .eq("email", payload.email)
      .maybeSingle()

    if (lookupError) {
      return {
        success: false,
        error: "NEWSLETTER_UNSUBSCRIBE_ERROR",
        details: { database: [lookupError.message] },
      }
    }

    if (subscriber?.status === "unsubscribed") {
      return { success: true, data: null }
    }

    return {
      success: false,
      error: "NEWSLETTER_SUBSCRIBER_NOT_FOUND",
    }
  } catch (error) {
    console.error("Failed to unsubscribe newsletter subscriber:", error)
    return {
      success: false,
      error: "NEWSLETTER_UNSUBSCRIBE_ERROR",
      details: {
        system: [
          error instanceof Error ? error.message : "Unknown unsubscribe error",
        ],
      },
    }
  }
}
