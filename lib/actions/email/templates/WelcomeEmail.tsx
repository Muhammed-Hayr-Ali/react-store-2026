import { EmailTemplate } from "./EmailTemplate"

interface WelcomeEmailProps {
  userName: string
  companyName?: string
}

export function WelcomeEmail({ userName, companyName = "MarketNA" }: WelcomeEmailProps) {
  const greeting = `أهلاً بك ${userName}`
  const body = `
    <p>يسعدنا انضمامك إلى ${companyName}!</p>
    <p>نحن متحمسون لبدء رحلتك معنا. ستجد لدينا العديد من الميزات الرائعة التي تساعدك على تحقيق أهدافك.</p>
    <p>إذا كان لديك أي أسئلة، لا تتردد في التواصل مع فريق الدعم لدينا.</p>
  `
  const ctaText = "ابدأ الآن"
  const ctaLink = process.env.NEXT_PUBLIC_APP_URL
  const footerText = "نحن هنا لمساعدتك في كل خطوة"

  return {
    subject: `مرحباً بك في ${companyName}!`,
    html: EmailTemplate({
      title: "مرحباً بك",
      greeting,
      body,
      ctaText,
      ctaLink,
      footerText,
      companyName,
    }),
    text: `أهلاً بك ${userName}!\n\nيسعدنا انضمامك إلى ${companyName}!\n\nنحن متحمسون لبدء رحلتك معنا.\n\n${companyName}`,
  }
}
