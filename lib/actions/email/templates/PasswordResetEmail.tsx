import { EmailTemplate } from "./EmailTemplate"

interface PasswordResetEmailProps {
  userName?: string
  resetLink: string
  companyName?: string
  expiresInMinutes?: number
}

export function PasswordResetEmail({
  userName = "",
  resetLink,
  companyName = "MarketNA",
  expiresInMinutes = 60,
}: PasswordResetEmailProps) {
  const greeting = userName ? `أهلاً بك ${userName}` : "أهلاً بك"
  const body = `
    <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
    <p>انقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
    <p style="color: #71717a; font-size: 14px;">
      ⏱️ هذا الرابط صالح لمدة ${expiresInMinutes} دقيقة
    </p>
    <p style="color: #71717a; font-size: 14px;">
      إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
    </p>
  `
  const ctaText = "إعادة تعيين كلمة المرور"
  const ctaLink = resetLink
  const footerText = "نحمي حسابك بأعلى معايير الأمان"

  return {
    subject: `إعادة تعيين كلمة المرور - ${companyName}`,
    html: EmailTemplate({
      title: "إعادة تعيين كلمة المرور",
      greeting,
      body,
      ctaText,
      ctaLink,
      footerText,
      companyName,
    }),
    text: `أهلاً بك ${userName}!\n\nلقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.\n\nرابط إعادة التعيين: ${resetLink}\n\nهذا الرابط صالح لمدة ${expiresInMinutes} دقيقة.`,
  }
}
