/**
 * @file lib/actions/newsletter_subscribers/queries/get-subscribers-page-data.ts
 * @description Handles newsletter subscribers fetching, summary calculations, and mobile detection.
 */

import { headers } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import { getNewsletterSubscribers } from "./get-newsletter-subscribers"
import type { NewsletterSubscriber } from "../types"

export interface SubscribersPageData {
  subscribers: NewsletterSubscriber[]
  summary: {
    total: number
    active: number
    unsubscribed: number
  }
  isMobile: boolean
}

/**
 * تجهز المشتركين وملخص حالات الاشتراك ومؤشر عرض الهاتف.
 */
export async function getSubscribersPageData(): Promise<
  ApiResult<SubscribersPageData>
> {
  const result = await getNewsletterSubscribers()

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      details: result.details,
    }
  }

  const subscribers = result.data

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
