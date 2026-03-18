import { EmailTemplate } from "./EmailTemplate"

interface VerificationEmailProps {
  code: string
  userName?: string
  companyName?: string
  expiresInMinutes?: number
}

export function VerificationEmail({
  code,
  userName,
  companyName = "MarketNA",
  expiresInMinutes = 10,
}: VerificationEmailProps) {
  const greeting = userName ? `أهلاً بك ${userName}` : "أهلاً بك"
  const body = `
    <p>شكراً لتسجيلك في ${companyName}.</p>
    <p>يرجى استخدام رمز التحقق التالي لإكمال عملية التسجيل:</p>
    <div style="background-color: #f4f4f5; border: 2px dashed #e4e4e7; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 700; color: #18181b; letter-spacing: 8px;">${code}</span>
    </div>
    <p style="color: #71717a; font-size: 14px;">
      ⏱️ هذا الرمز صالح لمدة ${expiresInMinutes} دقائق
    </p>
    <p style="color: #71717a; font-size: 14px;">
      إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
    </p>
  `
  const footerText = "نحمي حسابك بأعلى معايير الأمان"

  return {
    subject: `رمز التحقق - ${companyName}`,
    html: EmailTemplate({
      title: "رمز التحقق",
      greeting,
      body,
      footerText,
      companyName,
    }),
    text: `شكراً لتسجيلك في ${companyName}.\n\nرمز التحقق: ${code}\n\nهذا الرمز صالح لمدة ${expiresInMinutes} دقيقة.`,
  }
}
