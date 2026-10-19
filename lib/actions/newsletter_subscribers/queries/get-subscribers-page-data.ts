/**
 * @file lib/actions/newsletter_subscribers/queries/get-subscribers-page-data.ts
 * @description Loads newsletter subscribers and page-specific device information.
 */

import { headers } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import { getNewsletterSubscribers } from "./get-newsletter-subscribers"
import type { NewsletterSubscriber } from "../types"

export interface SubscribersPageData {
  subscribers: NewsletterSubscriber[]
  isMobile: boolean
}

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
      isMobile,
    },
  }
}
