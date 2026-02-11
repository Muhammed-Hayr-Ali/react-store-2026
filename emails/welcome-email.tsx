// src/emails/welcome-email.tsx

import React from "react";
import { Heading, Text, Button, Section } from "@react-email/components";
import { MasterTemplate } from "./templates/master-template";

// --- 1. تحديث الواجهة (Interface) ---
// الخصائص التي سيستقبلها القالب
interface WelcomeEmailProps {
  userName?: string;
  discountCode: string;
  locale?: "ar" | "en"; // ✅ إضافة اللغة كخاصية
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const WelcomeEmail = ({
  userName,
  discountCode,
  locale = "en", // ✅ اللغة الافتراضية هي الإنجليزية
}: WelcomeEmailProps) => {
  // --- 2. تعريف النصوص بناءً على اللغة ---
  const isArabic = locale === "ar";

  // تحديد اسم العميل الافتراضي بناءً على اللغة
  const customerName =
    userName || (isArabic ? "عميلنا العزيز" : "Valued Customer");

  // تحديد النصوص المترجمة
  const content = {
    previewText: isArabic
      ? "شكرًا لانضمامك! إليك كود الخصم الخاص بك."
      : "Thanks for joining! Here's your discount code.",
    pageTitle: isArabic ? "أهلاً بك في Marketna!" : "Welcome to Marketna!",
    mainHeading: isArabic ? "أهلاً بك في Marketna!" : "Welcome to Marketna!",
    greeting: isArabic ? `مرحباً ${customerName}،` : `Hi ${customerName},`,
    welcomeMessage: isArabic
      ? "يسعدنا انضمامك إلى عائلتنا! نحن متحمسون لمشاركة أفضل العروض والمنتجات الجديدة معك."
      : "We're excited to have you join our family! We look forward to sharing the best new products and offers with you.",
    discountIntro: isArabic
      ? "كما وعدناك، إليك كود خصم بنسبة **10%** على طلبك الأول. استخدمه عند الدفع:"
      : "As promised, here is a **10%** discount code for your first order. Use it at checkout:",
    buttonText: isArabic ? "ابدأ التسوق الآن" : "Start Shopping Now",
  };

  // --- 3. استخدام النصوص الديناميكية في القالب ---
  return (
    <MasterTemplate
      previewText={content.previewText}
      pageTitle={content.pageTitle}
      locale={locale} // ✅ تمرير اللغة إلى القالب الرئيسي
    >
      <Heading as="h1" className="text-3xl font-bold text-center mb-6">
        {content.mainHeading}
      </Heading>

      {/* ✅ تطبيق اتجاه النص بناءً على اللغة */}
      <Section className={isArabic ? "text-right" : "text-left"}>
        <Text className="text-base leading-relaxed">{content.greeting}</Text>
        <Text className="text-base leading-relaxed">
          {content.welcomeMessage}
        </Text>
        <Text className="text-base leading-relaxed">
          {content.discountIntro}
        </Text>
      </Section>

      {/* كود الخصم (يبقى في المنتصف) */}
      <Section className="text-center my-8">
        <div className="bg-gray-100 border-dashed border-2 border-gray-300 rounded-lg p-4 inline-block">
          <Text className="text-2xl font-bold tracking-widest text-gray-800 m-0">
            {discountCode}
          </Text>
        </div>
      </Section>

      {/* زر الإجراء (يبقى في المنتصف) */}
      <Section className="text-center">
        <Button
          href={baseUrl}
          className="bg-black text-white rounded-md px-8 py-3 text-base font-medium"
        >
          {content.buttonText}
        </Button>
      </Section>
    </MasterTemplate>
  );
};

export default WelcomeEmail;
