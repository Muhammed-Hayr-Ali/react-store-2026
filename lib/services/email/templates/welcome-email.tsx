// lib/services/email/templates/welcome-email.tsx
import React from "react"
import { Text, Link, Button } from "@react-email/components"

import EmailLayout from "@/lib/services/email/templates/layout"
import { routing, type AppLocale } from "@/i18n/routing"

interface WelcomeEmailProps {
  locale?: AppLocale
  userName: string
  loginUrl: string
}

export default function WelcomeEmail({
  locale = routing.defaultLocale,
  userName,
  loginUrl,
}: WelcomeEmailProps) {
  const isArabic = locale === "ar"

  return (
    <EmailLayout
      locale={locale}
      title={
        isArabic
          ? "أهلاً بك في عائلة Marketna! 🎉"
          : "Welcome to the Marketna family! 🎉"
      }
    >
      <Text className="mb-4">
        {isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}
      </Text>
      <Text className="mb-4">
        {isArabic
          ? "نشكرك على انضمامك إلينا. نحن متحمسون جداً لبدء هذه الرحلة معك وتقديم أفضل تجربة تسوق إلكتروني."
          : "Thank you for joining us. We are excited to start this journey with you and provide the best online shopping experience."}
      </Text>
      <Text className="mb-6">
        {isArabic
          ? "يمكنك الآن الدخول إلى حسابك واستكشاف أحدث العروض والمنتجات."
          : "You can now sign in to your account and explore the latest offers and products."}
      </Text>

      {/* زر تفاعلي */}
      <Button
        href={loginUrl}
        className="mx-auto my-6 block w-fit rounded-xl bg-green-700 px-6 py-3 text-center font-bold text-white no-underline"
      >
        {isArabic ? "الدخول إلى حسابي" : "Go to my account"}
      </Button>

      <Text className="mt-8 text-sm text-gray-500">
        {isArabic
          ? "إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذه الرسالة أو "
          : "If you did not create this account, please ignore this message or "}
        <Link href="mailto:support@marketna.com" className="text-green-700">
          {isArabic ? "التواصل مع الدعم الفني" : "contact support"}
        </Link>
        .
      </Text>
    </EmailLayout>
  )
}

Object.defineProperty(WelcomeEmail, "PreviewProps", {
  value: {
    locale: routing.defaultLocale,
    userName: "Marketna customer",
    loginUrl: "https://example.com/auth/login",
  } satisfies WelcomeEmailProps,
})
