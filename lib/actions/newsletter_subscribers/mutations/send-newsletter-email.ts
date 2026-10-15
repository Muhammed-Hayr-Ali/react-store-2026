"use server"

import React from "react"

import { appRoutes } from "@/lib/config/app-routes"
import { createServerClient } from "@/lib/database/supabase/server"
import { sendEmail } from "@/lib/services/email/send-email"
import NewsletterBroadcastEmail from "@/lib/services/email/templates/newsletter-broadcast-email"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { sendNewsletterEmailSchema } from "../schemas"
import {
  createNewsletterUnsubscribeToken,
  NewsletterUnsubscribeConfigurationError,
} from "../unsubscribe-token"

type NewsletterEmailSendResult =
  | { success: true; data: { sentCount: number } }
  | {
      success: false
      error: string
      details?: Record<string, string[]>
      sentCount?: number
      failedCount?: number
      failedSubscriberIds?: string[]
      invalidSubscriberIds?: string[]
      inactiveSubscriberIds?: string[]
      missingSubscriberIds?: string[]
    }

export async function sendNewsletterEmail(
  input: unknown
): Promise<NewsletterEmailSendResult> {
  const canSend = await hasPermission(PERMISSIONS.SEND_NEWSLETTER_EMAIL)
  if (!canSend) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = sendNewsletterEmailSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { subscriberIds, subject, message, locale } = validation.data
  const supabase = await createServerClient()
  const { data: recipients, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, status")
    .in("id", subscriberIds)

  if (error) {
    return {
      success: false,
      error: "GET_NEWSLETTER_SUBSCRIBERS_ERROR",
      details: { database: [error.message] },
    }
  }

  const activeRecipients = (recipients ?? []).filter(
    (recipient) => recipient.status === "active"
  )
  if (activeRecipients.length !== subscriberIds.length) {
    const foundIds = new Set(
      (recipients ?? []).map((recipient) => recipient.id)
    )
    const inactiveSubscriberIds = (recipients ?? [])
      .filter((recipient) => recipient.status !== "active")
      .map((recipient) => recipient.id)
    const missingSubscriberIds = subscriberIds.filter((id) => !foundIds.has(id))
    return {
      success: false,
      error: "NEWSLETTER_RECIPIENTS_CHANGED",
      invalidSubscriberIds: [...inactiveSubscriberIds, ...missingSubscriberIds],
      inactiveSubscriberIds,
      missingSubscriberIds,
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const baseUnsubscribeUrl = new URL(appRoutes.newsletterUnsubscribe, baseUrl)
  let sentCount = 0
  let failedCount = 0
  const failedSubscriberIds: string[] = []

  for (const recipient of activeRecipients) {
    let unsubscribeToken: string
    try {
      unsubscribeToken = createNewsletterUnsubscribeToken(recipient.email)
    } catch (error) {
      if (error instanceof NewsletterUnsubscribeConfigurationError) {
        console.error("Newsletter email requires an unsubscribe secret.")
        return {
          success: false,
          error: "NEWSLETTER_UNSUBSCRIBE_CONFIGURATION_ERROR",
        }
      }
      throw error
    }

    const unsubscribeUrl = new URL(baseUnsubscribeUrl)
    unsubscribeUrl.searchParams.set("token", unsubscribeToken)

    const result = await sendEmail({
      to: recipient.email,
      subject,
      reactComponent: React.createElement(NewsletterBroadcastEmail, {
        locale,
        message,
        unsubscribeUrl: unsubscribeUrl.toString(),
      }),
    })

    if (result.success) {
      sentCount += 1
    } else {
      failedCount += 1
      failedSubscriberIds.push(recipient.id)
      console.error("Failed to send newsletter message to subscriber:", {
        subscriberId: recipient.id,
        error: result.error,
      })
    }
  }

  if (failedCount > 0) {
    return {
      success: false,
      error: "NEWSLETTER_EMAIL_PARTIAL_FAILURE",
      sentCount,
      failedCount,
      failedSubscriberIds,
    }
  }

  return { success: true, data: { sentCount } }
}
