// src/emails/newsletter-confirmation-email.tsx

import { Heading, Text, Button, Section, Hr } from "@react-email/components";
import { MasterTemplate } from "./templates/master-template";

// --- 1. واجهة الخصائص (Interface) ---
interface NewsletterConfirmationProps {
  userName?: string;
  unsubscribeUrl: string; // ✅ رابط إلغاء الاشتراك إلزامي
  locale?: "ar" | "en";
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const NewsletterConfirmationEmail = ({
  userName,
  unsubscribeUrl,
  locale = "en",
}: NewsletterConfirmationProps) => {
  // --- 2. تحديد اللغة والنصوص الديناميكية ---
  const isArabic = locale === "ar";

  const customerName =
    userName || (isArabic ? "مشتركنا العزيز" : "Valued Subscriber");

  const content = {
    previewText: isArabic
      ? "تم تأكيد اشتراكك بنجاح! استعد لأحدث العروض."
      : "You're subscribed! Get ready for the latest updates and offers.",
    pageTitle: isArabic ? "تأكيد الاشتراك في النشرة" : "Subscription Confirmed",
    mainHeading: isArabic
      ? "شكرًا لاشتراكك في نشرتنا!"
      : "Thanks for Subscribing!",
    greeting: isArabic ? `أهلاً بك ${customerName}،` : `Hi ${customerName},`,
    confirmationMessage: isArabic
      ? "لقد تم تأكيد بريدك الإلكتروني بنجاح. من الآن فصاعدًا، ستصلك أحدث الأخبار، والعروض الحصرية، ومنتجاتنا الجديدة مباشرة إلى صندوق الوارد الخاص بك."
      : "Your email has been successfully confirmed. From now on, you'll receive the latest news, exclusive offers, and new products straight to your inbox.",
    nextStepsTitle: isArabic ? "ماذا تتوقع منا؟" : "What to expect?",
    nextStepsList: isArabic
      ? [
          "عروض حصرية للمشتركين فقط.",
          "إشعارات بالمنتجات الجديدة أولاً بأول.",
          "نصائح ومقالات مختارة بعناية.",
        ]
      : [
          "Exclusive deals for subscribers only.",
          "First access to new product launches.",
          "Curated tips and articles.",
        ],
    visitStoreButton: isArabic ? "تصفح المتجر" : "Visit Our Store",
    footerNote: isArabic
      ? "لا ترغب في تلقي هذه الرسائل؟"
      : "No longer want to receive these emails?",
    unsubscribeLinkText: isArabic ? "إلغاء الاشتراك" : "Unsubscribe",
  };

  // --- 3. بناء القالب ---
  return (
    <MasterTemplate
      previewText={content.previewText}
      pageTitle={content.pageTitle}
      locale={locale}
    >
      <Heading as="h1" className="text-3xl font-bold text-center mb-6">
        {content.mainHeading}
      </Heading>

      {/* قسم التحية والرسالة */}
      <Section className={isArabic ? "text-right" : "text-left"}>
        <Text className="text-base leading-relaxed">{content.greeting}</Text>
        <Text className="text-base leading-relaxed">
          {content.confirmationMessage}
        </Text>
      </Section>

      {/* قسم "ماذا تتوقع" (اختياري لتحسين الشكل) */}
      <Section className={isArabic ? "text-right" : "text-left"}>
        <Heading as="h3" className="text-xl font-semibold mt-4 mb-2">
          {content.nextStepsTitle}
        </Heading>
        <ul className={isArabic ? "pr-4 list-disc" : "pl-4 list-disc"}>
          {content.nextStepsList.map((item, index) => (
            <li key={index} className="text-base leading-relaxed mb-1">
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* زر زيارة المتجر */}
      <Section className="text-center my-8">
        <Button
          href={baseUrl}
          className="bg-black text-white rounded-md px-8 py-3 text-base font-medium"
        >
          {content.visitStoreButton}
        </Button>
      </Section>

      <Hr className="border-gray-300 my-6" />

      {/* تذييل الرسالة مع رابط إلغاء الاشتراك */}
      <Section className="text-center">
        <Text className="text-sm text-gray-500">
          {content.footerNote}{" "}
          <a
            href={unsubscribeUrl}
            className="text-gray-500 underline hover:text-gray-700"
            dir={isArabic ? "rtl" : "ltr"}
          >
            {content.unsubscribeLinkText}
          </a>
        </Text>
      </Section>
    </MasterTemplate>
  );
};

export default NewsletterConfirmationEmail;
