/**
 * @file lib/actions/newsletter_subscribers/queries/get-subscribers-page-data.ts
 * @description Handles newsletter subscribers fetching, summary calculations, and mobile detection.
 */

import { headers } from "next/headers"
import { getNewsletterSubscribers } from "@/lib/actions/newsletter_subscribers/queries/get-newsletter-subscribers"
import type { NewsletterSubscriber } from "@/lib/actions/newsletter_subscribers/types"

export interface SubscribersPageData {
  subscribers: NewsletterSubscriber[]
  summary: {
    total: number
    active: number
    unsubscribed: number
  }
  isMobile: boolean
}

export async function getSubscribersPageData(): Promise<{
  success: boolean
  data?: SubscribersPageData
  error?: string
}> {
  const result = await getNewsletterSubscribers()

  if (!result.success || !result.data) {
    return {
      success: false,
      error: "error" in result && typeof result.error === "string" ? result.error : "GET_NEWSLETTER_SUBSCRIBERS_ERROR",
    }
  }

  const subscribers = result.data as NewsletterSubscriber[]

  // Calculate summary metrics (Separation of Concerns)
  const total = subscribers.length
  const active = subscribers.filter((sub) => sub.status === "active").length
  const unsubscribed = total - active

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  return {
    success: true,
    data: {
      subscribers,
      summary: { total, active, unsubscribed },
      isMobile,
    },
  }
}