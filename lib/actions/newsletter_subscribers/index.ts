/**
 * @file lib/actions/newsletter_subscribers/index.ts
 * @description Exposes the public newsletter subscriber action API.
 */

// Mutations
export { createNewsletterSubscriber } from "./mutations/create-newsletter-subscriber"
export { deleteNewsletterSubscriber } from "./mutations/delete-newsletter-subscriber"
export { updateNewsletterSubscriberStatus } from "./mutations/update-newsletter-subscriber"
export { sendNewsletterEmail } from "./mutations/send-newsletter-email"
export { unsubscribeNewsletter } from "./mutations/unsubscribe-newsletter"

// Queries
export { getNewsletterSubscribers } from "./queries/get-newsletter-subscribers"
export { getNewsletterSubscribersSummary } from "./queries/get-newsletter-subscribers-summary"
export { getSubscribersPageData } from "./queries/get-subscribers-page-data"

// Types
export type { NewsletterSubscriber, NewsletterSubscribersSummary } from "./types"
export type { NewsletterSubscriberInput } from "./schemas"
