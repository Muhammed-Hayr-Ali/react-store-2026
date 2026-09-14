// lib/services/email/templates/reset-password-email.tsx
import React from "react"
import EmailLayout from "./layout"
import { Text, Button, Link } from "@react-email/components"

interface ResetPasswordEmailProps {
  firstName: string
  resetUrl: string
}

export default function ResetPasswordEmail({ firstName, resetUrl }: ResetPasswordEmailProps) {
  return (
    <EmailLayout title="استعادة كلمة المرور 🔒">
      <Text className="mb-4">مرحباً {firstName}،</Text>
      <Text className="mb-4">
        لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في متجر Marketna.
      </Text>
      <Text className="mb-6">
        إذا لم تقم بهذا الطلب، يرجى تجاهل هذه الرسالة. كلمة مرورك الحالية ستبقى
        آمنة.
      </Text>

      <Button
        href={resetUrl}
        className="mx-auto my-6 block w-fit rounded-md bg-black px-6 py-3 text-center font-bold text-white no-underline"
      >
        إعادة تعيين كلمة المرور
      </Button>

      <Text className="mt-8 text-sm text-gray-500">
        أو انسخ هذا الرابط والصقه في متصفحك:
        <br />
        <Link href={resetUrl} className="break-all text-[#25D366]">
          {resetUrl}
        </Link>
      </Text>
      <Text className="mt-4 text-xs text-gray-400">
        هذا الرابط صالح لمدة 15 دقيقة فقط وللاستخدام لمرة واحدة.
      </Text>
    </EmailLayout>
  )
}
