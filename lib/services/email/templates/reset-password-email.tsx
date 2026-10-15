// lib/services/email/templates/reset-password-email.tsx
import React from "react"
import EmailLayout from "./layout"
import { Text, Button, Link } from "@react-email/components"
import { routing, type AppLocale } from "@/i18n/routing"

interface ResetPasswordEmailProps {
  locale?: AppLocale
  firstName: string
  resetUrl: string
}

export default function ResetPasswordEmail({
  locale = routing.defaultLocale,
  firstName,
  resetUrl,
}: ResetPasswordEmailProps) {
  const isArabic = locale === "ar"

  return (
    <EmailLayout
      locale={locale}
      title={isArabic ? "استعادة كلمة المرور 🔒" : "Reset your password 🔒"}
    >
      <Text className="mb-4">
        {isArabic ? `مرحباً ${firstName}،` : `Hello ${firstName},`}
      </Text>
      <Text className="mb-4">
        {isArabic
          ? "لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في متجر Marketna."
          : "We received a request to reset the password for your Marketna account."}
      </Text>
      <Text className="mb-6">
        {isArabic
          ? "إذا لم تقم بهذا الطلب، يرجى تجاهل هذه الرسالة. كلمة مرورك الحالية ستبقى آمنة."
          : "If you did not make this request, you can ignore this email. Your current password will remain unchanged."}
      </Text>

      <Button
        href={resetUrl}
        className="mx-auto my-6 block w-fit rounded-xl bg-green-700 px-6 py-3 text-center font-bold text-white no-underline"
      >
        {isArabic ? "إعادة تعيين كلمة المرور" : "Reset password"}
      </Button>

      <Text className="mt-8 text-sm text-gray-500">
        {isArabic
          ? "أو انسخ هذا الرابط والصقه في متصفحك:"
          : "Or copy and paste this link into your browser:"}
        <br />
        <Link href={resetUrl} className="break-all text-green-700">
          {resetUrl}
        </Link>
      </Text>
      <Text className="mt-4 text-xs text-gray-400">
        {isArabic
          ? "هذا الرابط صالح لمدة 15 دقيقة فقط وللاستخدام لمرة واحدة."
          : "This link expires in 15 minutes and can only be used once."}
      </Text>
    </EmailLayout>
  )
}

Object.defineProperty(ResetPasswordEmail, "PreviewProps", {
  value: {
    locale: routing.defaultLocale,
    firstName: "Alex",
    resetUrl: "https://example.com/auth/reset-password?token=preview",
  } satisfies ResetPasswordEmailProps,
})
