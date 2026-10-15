// lib/services/email/templates/Layout.tsx
import {
  Html,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Tailwind,
  Hr,
} from "@react-email/components"
import React from "react"
import type { AppLocale } from "@/i18n/routing"

interface EmailLayoutProps {
  children: React.ReactNode
  locale: AppLocale
  title: string
  footerContent?: React.ReactNode
}

export default function EmailLayout({
  children,
  locale,
  title,
  footerContent,
}: EmailLayoutProps) {
  const isArabic = locale === "ar"

  return (
    <Html lang={locale} dir={isArabic ? "rtl" : "ltr"}>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-xl overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            {/* Brand header */}
            <Section className="bg-green-700 p-4 text-center">
              <Heading className="m-0 text-2xl font-bold text-white">
                Marketna
              </Heading>
            </Section>

            {/* محتوى الرسالة المتغير */}
            <Section className="p-8">
              <Heading
                className={`mb-4 text-xl font-bold text-gray-800 ${isArabic ? "text-right" : "text-left"}`}
              >
                {title}
              </Heading>
              <div
                className={`text-base leading-relaxed text-gray-600 ${isArabic ? "text-right" : "text-left"}`}
              >
                {children}
              </div>
            </Section>

            {/* الخط الفاصل والتذييل */}
            <Hr className="my-0 border-gray-200" />
            <Section className="bg-gray-50 p-6 text-center">
              <Text className="m-0 text-sm text-gray-500">
                {isArabic
                  ? `© ${new Date().getFullYear()} متجر Marketna. جميع الحقوق محفوظة.`
                  : `© ${new Date().getFullYear()} Marketna. All rights reserved.`}
              </Text>
              <Text className="mt-2 text-xs text-gray-400">
                {isArabic
                  ? "هذه رسالة تلقائية، يرجى عدم الرد عليها."
                  : "This is an automated message. Please do not reply."}
              </Text>
              {footerContent}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
