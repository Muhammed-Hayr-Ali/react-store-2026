/**
 * @file lib/actions/newsletter_subscribers/mutations/delete-newsletter-subscriber.ts
 * @description Deletes a subscriber after permission and identifier checks.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import {
  newsletterSubscriberIdSchema,
  type NewsletterSubscriberIdInput,
} from "../schemas"

/**
 * تحذف مشتركًا من النشرة بعد التحقق من الصلاحية والمعرّف.
 */
export async function deleteNewsletterSubscriber(
  input: NewsletterSubscriberIdInput
): Promise<ApiResult<null>> {
  const canDelete = await hasPermission(
    PERMISSIONS.DELETE_NEWSLETTER_SUBSCRIBER
  )
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = newsletterSubscriberIdSchema.safeParse(input)
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
    .delete()
    .eq("id", validation.data.id)
    .select("id")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "DELETE_NEWSLETTER_SUBSCRIBER_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return {
      success: false,
      error: "NEWSLETTER_SUBSCRIBER_NOT_FOUND",
    }
  }

  return { success: true, data: null }
}
