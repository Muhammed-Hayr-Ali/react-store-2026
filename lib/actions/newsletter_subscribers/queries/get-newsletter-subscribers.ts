/**
 * @file lib/actions/newsletter_subscribers/queries/get-newsletter-subscribers.ts
 * @description Retrieves newsletter subscribers for authorized management workflows.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import type { NewsletterSubscriber } from "../types"

export async function getNewsletterSubscribers(): Promise<
  ApiResult<NewsletterSubscriber[]>
> {
  const canViewManagement = await hasPermission(
    PERMISSIONS.VIEW_NEWSLETTER_SUBSCRIBERS
  )
  if (!canViewManagement) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "GET_NEWSLETTER_SUBSCRIBERS_ERROR",
      details: { database: [error.message] },
    }
  }

  return {
    success: true,
    data: (data ?? []) as NewsletterSubscriber[],
  }
}
