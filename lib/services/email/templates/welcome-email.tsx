// lib/services/email/templates/welcome-email.tsx
import React from "react"
import EmailLayout from "@/lib/services/email/templates/layout"
import { Text, Link, Button } from "@react-email/components"

interface WelcomeEmailProps {
  userName: string
  loginUrl: string
}

export default function WelcomeEmail({
  userName,
  loginUrl,
}: WelcomeEmailProps) {
  return (
    <EmailLayout title="أهلاً بك في عائلة Marketna! 🎉">
      <Text className="mb-4">مرحباً {userName}،</Text>
      <Text className="mb-4">
        نشكرك على انضمامك إلينا. نحن متحمسون جداً لبدء هذه الرحلة معك وتقديم
        أفضل تجربة تسوق إلكتروني.
      </Text>
      <Text className="mb-6">
        يمكنك الآن الدخول إلى حسابك واستكشاف أحدث العروض والمنتجات.
      </Text>

      {/* زر تفاعلي */}
      <Button
        href={loginUrl}
        className="mx-auto my-6 block w-fit rounded-md bg-black px-6 py-3 text-center font-bold text-white no-underline"
      >
        الدخول إلى حسابي
      </Button>

      <Text className="mt-8 text-sm text-gray-500">
        إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذه الرسالة أو
        <Link href="mailto:support@marketna.com" className="text-black">
          التواصل مع الدعم الفني
        </Link>
        .
      </Text>
    </EmailLayout>
  )
}
