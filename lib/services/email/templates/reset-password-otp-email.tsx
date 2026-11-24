// lib/services/email/templates/reset-password-otp-email.tsx
import React from "react"
import EmailLayout from "./layout"
import { Section, Text } from "@react-email/components"
import { routing, type AppLocale } from "@/i18n/routing"

interface ResetPasswordOtpEmailProps {
  locale?: AppLocale
  firstName: string
  otpCode: string
  expiresInMinutes?: number
}

export default function ResetPasswordOtpEmail({
  locale = routing.defaultLocale,
  firstName,
  otpCode,
  expiresInMinutes = 15,
}: ResetPasswordOtpEmailProps) {
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
          ? "استخدم رمز التحقق التالي في التطبيق لإتمام العملية:"
          : "Use the following verification code in the app to complete the process:"}
      </Text>

      <Section className="my-6 rounded-xl border border-green-200 bg-green-50 px-6 py-4 text-center">
        <Text
          dir="ltr"
          className="m-0 font-mono text-3xl font-bold tracking-[0.35em] text-green-800"
        >
          {otpCode}
        </Text>
      </Section>

      <Text className="mt-6 text-sm text-gray-500">
        {isArabic
          ? "إذا لم تقم بهذا الطلب، يرجى تجاهل هذه الرسالة. كلمة مرورك الحالية ستبقى آمنة."
          : "If you did not make this request, you can ignore this email. Your current password will remain unchanged."}
      </Text>
      <Text className="mt-4 text-xs text-gray-400">
        {isArabic
          ? `هذا الرمز صالح لمدة ${expiresInMinutes} دقيقة فقط وللاستخدام لمرة واحدة.`
          : `This code expires in ${expiresInMinutes} minutes and can only be used once.`}
      </Text>
    </EmailLayout>
  )
}

Object.defineProperty(ResetPasswordOtpEmail, "PreviewProps", {
  value: {
    locale: routing.defaultLocale,
    firstName: "Alex",
    otpCode: "482915",
    expiresInMinutes: 15,
  } satisfies ResetPasswordOtpEmailProps,
})