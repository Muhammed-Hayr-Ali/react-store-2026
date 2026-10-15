import { Link, Text } from "@react-email/components"

import { routing, type AppLocale } from "@/i18n/routing"
import EmailLayout from "./layout"

interface NewsletterBroadcastEmailProps {
  locale: AppLocale
  message: string
  unsubscribeUrl: string
}

export default function NewsletterBroadcastEmail({
  locale,
  message,
  unsubscribeUrl,
}: NewsletterBroadcastEmailProps) {
  const isArabic = locale === "ar"
  const lines = message.split(/\r?\n/)

  return (
    <EmailLayout
      locale={locale}
      title={isArabic ? "رسالة من Marketna" : "A message from Marketna"}
      footerContent={
        <Text className="mt-4 text-xs text-gray-500">
          {isArabic
            ? "لم تعد ترغب في تلقي رسائلنا؟ "
            : "No longer want to receive our emails? "}
          <Link href={unsubscribeUrl} className="text-green-700 underline">
            {isArabic ? "إلغاء الاشتراك" : "Unsubscribe"}
          </Link>
        </Text>
      }
    >
      <Text
        className={`mb-4 whitespace-pre-line ${isArabic ? "text-right" : "text-left"}`}
      >
        {lines.map((line, index) => (
          <span key={`${index}-${line}`}>
            {line}
            {index < lines.length - 1 && <br />}
          </span>
        ))}
      </Text>
    </EmailLayout>
  )
}

Object.defineProperty(NewsletterBroadcastEmail, "PreviewProps", {
  value: {
    locale: routing.defaultLocale,
    message:
      "Hello from Marketna!\n\nHere are the latest updates from our store.",
    unsubscribeUrl: "https://example.com/unsubscribe?token=preview",
  } satisfies NewsletterBroadcastEmailProps,
})
