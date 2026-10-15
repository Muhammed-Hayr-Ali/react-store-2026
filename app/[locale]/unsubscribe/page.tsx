import type { Metadata } from "next"

import { NewsletterUnsubscribeForm } from "@/components/store/footer/newsletter-unsubscribe-form"
import { readNewsletterUnsubscribeToken } from "@/lib/actions/newsletter_subscribers/unsubscribe-token"

export const metadata: Metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
}

interface NewsletterUnsubscribePageProps {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function NewsletterUnsubscribePage({
  searchParams,
}: NewsletterUnsubscribePageProps) {
  const { token: queryToken } = await searchParams
  const token = typeof queryToken === "string" ? queryToken : null
  const subscriber = token ? readNewsletterUnsubscribeToken(token) : null

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <NewsletterUnsubscribeForm
        token={subscriber ? token : null}
        email={subscriber?.email ?? null}
      />
    </main>
  )
}
