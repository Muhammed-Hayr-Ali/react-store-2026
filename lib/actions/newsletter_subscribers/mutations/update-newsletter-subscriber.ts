/**
 * @file lib/actions/newsletter_subscribers/mutations/update-newsletter-subscriber.ts
 * @description Updates a subscriber's status after permission and input checks.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

 import { getValidationDetails } from "../../validation"
import {
  updateNewsletterSubscriberStatusSchema,
  type UpdateNewsletterSubscriberStatusInput,
} from "../schemas"
import type { NewsletterSubscriber } from "../types"

/**
 * تحدث حالة اشتراك البريد وتزيل سبب إلغاء الاشتراك عند إعادة التفعيل.
 */
export async function updateNewsletterSubscriberStatus(
  input: UpdateNewsletterSubscriberStatusInput
): Promise<ApiResult<NewsletterSubscriber>> {
 
  const validation = updateNewsletterSubscriberStatusSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .update({
      status: validation.data.status,
      ...(validation.data.status === "active" && { unsubscribe_reason: null }),
    })
    .eq("id", validation.data.id)
    .select("*")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "UPDATE_NEWSLETTER_SUBSCRIBER_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return {
      success: false,
      error: "NEWSLETTER_SUBSCRIBER_NOT_FOUND",
    }
  }

  return { success: true, data: data as NewsletterSubscriber }
}
