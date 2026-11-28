/**
 * @file lib/actions/newsletter_subscribers/types.ts
 * @description TypeScript types for newsletter subscribers and action inputs.
 */

import type { Tables } from "@/lib/database/supabase/database.types"

export type { NewsletterStatus } from "./schemas"

export type NewsletterSubscriber = Tables<"newsletter_subscribers">

export interface NewsletterSubscribersSummary {
  total: number
  active: number
  unsubscribed: number
}
