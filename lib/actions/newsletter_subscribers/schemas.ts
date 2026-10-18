/**
 * @file lib/actions/newsletter_subscribers/schemas.ts
 * @description Zod schemas for newsletter subscriber validation with translation keys.
 */

import { z } from "zod"

export const NEWSLETTER_EMAIL_BATCH_LIMIT = 50

export const newsletterSubscriberSchema = z.object({
  email: z.string().trim().email({ message: "INVALID_EMAIL" }),
  locale: z.string().optional(),
})

export const newsletterSubscriberIdSchema = z.object({
  id: z.string().uuid({ message: "INVALID_UUID_ERROR" }),
})

export const newsletterStatusSchema = z.object({
  status: z.enum(["active", "unsubscribed"], {
    message: "INVALID_NEWSLETTER_STATUS",
  }),
})

export const NEWSLETTER_UNSUBSCRIBE_REASON_CODES = [
  "TOO_MANY_EMAILS",
  "NOT_RELEVANT",
  "NEVER_SIGNED_UP",
  "TEMPORARY",
  "OTHER",
] as const

export const newsletterUnsubscribeReasonSchema = z.enum(
  NEWSLETTER_UNSUBSCRIBE_REASON_CODES
)

export const unsubscribeNewsletterSchema = z
  .object({
    token: z.string().min(1).max(2048),
    reasons: z.array(newsletterUnsubscribeReasonSchema).max(5),
    otherReason: z.string().trim().max(500).optional(),
  })
  .superRefine(({ reasons, otherReason }, context) => {
    if (reasons.includes("OTHER") && !otherReason) {
      context.addIssue({
        code: "custom",
        path: ["otherReason"],
        message: "NEWSLETTER_OTHER_REASON_REQUIRED",
      })
    }
  })

export const updateNewsletterSubscriberStatusSchema =
  newsletterSubscriberIdSchema.extend({
    status: newsletterStatusSchema.shape.status,
  })

export const sendNewsletterEmailSchema = z
  .object({
    subscriberIds: z
      .array(newsletterSubscriberIdSchema.shape.id)
      .min(1, { message: "NEWSLETTER_RECIPIENTS_REQUIRED" })
      .max(NEWSLETTER_EMAIL_BATCH_LIMIT, {
        message: "NEWSLETTER_BATCH_LIMIT_EXCEEDED",
      }),
    subject: z
      .string()
      .trim()
      .min(1, { message: "NEWSLETTER_SUBJECT_REQUIRED" })
      .max(200, { message: "NEWSLETTER_SUBJECT_TOO_LONG" }),
    message: z
      .string()
      .trim()
      .min(1, { message: "NEWSLETTER_MESSAGE_REQUIRED" })
      .max(5000, { message: "NEWSLETTER_MESSAGE_TOO_LONG" }),
    locale: z.enum(["en", "ar"]),
  })
  .superRefine(({ subscriberIds }, context) => {
    if (new Set(subscriberIds).size !== subscriberIds.length) {
      context.addIssue({
        code: "custom",
        path: ["subscriberIds"],
        message: "NEWSLETTER_DUPLICATE_RECIPIENTS",
      })
    }
  })

export type NewsletterSubscriberInput = z.input<
  typeof newsletterSubscriberSchema
>
export type NewsletterSubscriberIdInput = z.input<
  typeof newsletterSubscriberIdSchema
>
export type UpdateNewsletterSubscriberStatusInput = z.input<
  typeof updateNewsletterSubscriberStatusSchema
>
export type NewsletterStatus = z.infer<
  typeof newsletterStatusSchema.shape.status
>
