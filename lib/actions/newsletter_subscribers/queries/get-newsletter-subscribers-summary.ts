/**
 * @file lib/actions/newsletter_subscribers/queries/get-newsletter-subscribers-summary.ts
 * @description Retrieves aggregate counts for the newsletter subscribers summary.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
 import type { NewsletterSubscribersSummary } from "../types"

export async function getNewsletterSubscribersSummary(): Promise<
  ApiResult<NewsletterSubscribersSummary>
> {
 

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("status")

  if (error) {
    return {
      success: false,
      error: "GET_NEWSLETTER_SUBSCRIBERS_ERROR",
      details: { database: [error.message] },
    }
  }

  const subscribers = (data ?? []) as Array<{ status: string | null }>
  const active = subscribers.filter((subscriber) => subscriber.status === "active").length

  return {
    success: true,
    data: {
      total: subscribers.length,
      active,
      unsubscribed: subscribers.length - active,
    },
  }
}
