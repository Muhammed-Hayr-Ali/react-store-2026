import { Link, Text } from "@react-email/components"

import { routing, type AppLocale } from "@/i18n/routing"
import EmailLayout from "./layout"

interface NewsletterConfirmationEmailProps {
  email: string
  locale?: AppLocale
  unsubscribeUrl: string
}

export default function NewsletterConfirmationEmail({
  email,
  locale = routing.defaultLocale,
  unsubscribeUrl,
}: NewsletterConfirmationEmailProps) {
  const isArabic = locale === "ar"

  return (
    <EmailLayout
      locale={locale}
      title={
        isArabic
          ? "تم تأكيد اشتراكك في نشرتنا البريدية"
          : "Your newsletter subscription is confirmed"
      }
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
      <Text className="mb-4">{isArabic ? "مرحبًا،" : "Hello,"}</Text>
      <Text className="mb-4">
        {isArabic
          ? `تمت إضافة ${email} إلى قائمتنا البريدية. سنرسل إليك آخر الأخبار والعروض والتحديثات.`
          : `${email} has been added to our newsletter. We’ll send you the latest news, offers, and updates.`}
      </Text>
      <Text className="mb-4">
        {isArabic
          ? "يمكنك إلغاء الاشتراك باستخدام الرابط الموجود في أسفل هذه الرسالة. الرابط صالح لمدة 24 ساعة."
          : "You can unsubscribe using the link at the bottom of this email. The link is valid for 24 hours."}
      </Text>
    </EmailLayout>
  )
}

Object.defineProperty(NewsletterConfirmationEmail, "PreviewProps", {
  value: {
    email: "customer@example.com",
    locale: routing.defaultLocale,
    unsubscribeUrl: "https://example.com/unsubscribe?token=preview",
  } satisfies NewsletterConfirmationEmailProps,
})
