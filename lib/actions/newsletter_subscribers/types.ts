/**
 * @file lib/actions/newsletter_subscribers/types.ts
 * @description TypeScript types for newsletter subscribers and action inputs.
 */

import type { NewsletterStatus } from "./schemas"

export type { NewsletterStatus } from "./schemas"

export interface NewsletterSubscriber {
  id: string
  email: string
  status: NewsletterStatus | null
  created_at: string
  unsubscribe_reason: string | null
}

export interface NewsletterSubscribersSummary {
  total: number
  active: number
  unsubscribed: number
}
