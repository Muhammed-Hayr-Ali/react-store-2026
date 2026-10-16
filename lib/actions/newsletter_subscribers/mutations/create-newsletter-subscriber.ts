/**
 * @file lib/actions/newsletter_subscribers/mutations/create-newsletter-subscriber.ts
 * @description Adds a valid email address to the public newsletter list.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"

import { appRoutes } from "@/lib/config/app-routes"
import { sendEmail } from "@/lib/services/email/send-email"
import { resolveEmailLocale } from "@/lib/services/email/locale"
import NewsletterConfirmationEmail from "@/lib/services/email/templates/newsletter-confirmation-email"
import {
  createNewsletterUnsubscribeToken,
  NewsletterUnsubscribeConfigurationError,
} from "../unsubscribe-token"
import { getValidationDetails } from "../../validation"
import {
  newsletterSubscriberSchema,
  type NewsletterSubscriberInput,
} from "../schemas"
import type { NewsletterSubscriber } from "../types"
import { createAdminClient } from "@/lib/database/supabase/admin"
import React from "react"

/**
 * تسجل عنوان بريد في النشرة وترسل رسالة تأكيد الاشتراك.
 */
export async function createNewsletterSubscriber(
  input: NewsletterSubscriberInput
): Promise<ApiResult<NewsletterSubscriber>> {
  const validation = newsletterSubscriberSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  try {
    const token = createNewsletterUnsubscribeToken(validation.data.email)
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        {
          email: validation.data.email,
          status: "active",
          unsubscribe_reason: null,
        },
        { onConflict: "email" }
      )
      .select("*")
      .single()

    if (error) {
      return {
        success: false,
        error: "CREATE_NEWSLETTER_SUBSCRIBER_ERROR",
        details: { database: [error.message] },
      }
    }
    const emailLocale = resolveEmailLocale(validation.data.locale)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const unsubscribeUrl = new URL(appRoutes.newsletterUnsubscribe, baseUrl)
    unsubscribeUrl.searchParams.set("token", token)
    const emailResult = await sendEmail({
      to: validation.data.email,
      subject:
        emailLocale === "ar"
          ? "تم تأكيد اشتراكك في نشرتنا البريدية"
          : "Your newsletter subscription is confirmed",
      reactComponent: React.createElement(NewsletterConfirmationEmail, {
        email: validation.data.email,
        locale: emailLocale,
        unsubscribeUrl: unsubscribeUrl.toString(),
      }),
    })

    if (!emailResult.success) {
      return {
        success: false,
        error: "NEWSLETTER_CONFIRMATION_EMAIL_ERROR",
        details: { email: [emailResult.error] },
      }
    }

    return { success: true, data: data as NewsletterSubscriber }
  } catch (error) {
    if (error instanceof NewsletterUnsubscribeConfigurationError) {
      console.error("Newsletter subscription requires an unsubscribe secret.")
      return {
        success: false,
        error: "NEWSLETTER_UNSUBSCRIBE_CONFIGURATION_ERROR",
      }
    }

    console.error(
      "Failed to create newsletter subscriber or send confirmation:",
      error
    )
    return {
      success: false,
      error: "CREATE_NEWSLETTER_SUBSCRIBER_ERROR",
      details: {
        system: [
          error instanceof Error ? error.message : "Unknown newsletter error",
        ],
      },
    }
  }
}
