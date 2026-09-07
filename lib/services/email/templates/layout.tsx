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

interface EmailLayoutProps {
  children: React.ReactNode
  title: string
}

export default function EmailLayout({ children, title }: EmailLayoutProps) {
  return (
    <Html lang="ar" dir="rtl">
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-xl overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            {/* الشريط العلوي باللون المفضل لديك */}
            <Section className="bg-black p-4 text-center">
              <Heading className="m-0 text-2xl font-bold text-white">
                Marketna
              </Heading>
            </Section>

            {/* محتوى الرسالة المتغير */}
            <Section className="p-8">
              <Heading className="mb-4 text-right text-xl font-bold text-gray-800">
                {title}
              </Heading>
              <div className="text-right text-base leading-relaxed text-gray-600">
                {children}
              </div>
            </Section>

            {/* الخط الفاصل والتذييل */}
            <Hr className="my-0 border-gray-200" />
            <Section className="bg-gray-50 p-6 text-center">
              <Text className="m-0 text-sm text-gray-500">
                © {new Date().getFullYear()} متجر Marketna. جميع الحقوق محفوظة.
              </Text>
              <Text className="mt-2 text-xs text-gray-400">
                هذه رسالة تلقائية، يرجى عدم الرد عليها.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
