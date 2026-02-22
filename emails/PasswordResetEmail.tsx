// src/emails/password-reset-email.tsx

import {
  Heading,
  Text,
  Section,
  Button,
  Hr,
  Link,
} from "@react-email/components";
import { MasterTemplate } from "./templates/master-template";

interface PasswordResetEmailProps {
  resetLink: string;
  userName?: string;
  locale?: "ar" | "en";
}

export const PasswordResetEmail = ({
  resetLink,
  userName,
  locale = "en",
}: PasswordResetEmailProps) => {
  const isArabic = locale === "ar";
  const customerName =
    userName || (isArabic ? "عميلنا العزيز" : "Valued Customer");
  const previewText = isArabic
    ? "طلب إعادة تعيين كلمة المرور"
    : "Password Reset Request";
  const pageTitle = isArabic
    ? "إعادة تعيين كلمة المرور"
    : "Reset Your Password";

  return (
    <MasterTemplate
      previewText={previewText}
      pageTitle={pageTitle}
      locale={locale}
    >
      <Heading as="h1" className="text-3xl font-bold text-center mb-6">
        {pageTitle}
      </Heading>

      <Section className={isArabic ? "text-right" : "text-left"}>
        <Text className="text-base leading-relaxed">
          {isArabic ? `مرحباً ${customerName}،` : `Hi ${customerName},`}
        </Text>
        <Text className="text-base leading-relaxed">
          {isArabic
            ? "تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك. إذا قمت بهذا الطلب، فانقر على الزر أدناه لتعيين كلمة مرور جديدة."
            : "We received a request to reset the password for your account. If you made this request, please click the button below to set a new password."}
        </Text>
      </Section>

      <Section className="text-center my-8">
        <Button
          href={resetLink}
          className="bg-black text-white rounded-md px-8 py-3 text-base font-medium"
        >
          {isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password"}
        </Button>
      </Section>

      <Section className={isArabic ? "text-right" : "text-left"}>
        <Text className="text-base leading-relaxed">
          {isArabic
            ? "إذا لم تطلب إعادة تعيين كلمة المرور، فيرجى تجاهل هذا البريد الإلكتروني."
            : "If you did not request a password reset, please ignore this email."}
        </Text>
      </Section>

      <Hr className="border-gray-200 my-6" />

      <Section className={isArabic ? "text-right" : "text-left"}>
        <Text className="text-sm text-gray-600">
          {isArabic
            ? "إذا لم يعمل الزر أعلاه، يمكنك نسخ ولصق الرابط التالي في متصفحك:"
            : "If the button above doesn't work, copy and paste the following link into your browser:"}
        </Text>
        <Link
          href={resetLink}
          className="text-sm text-blue-600 break-all"
          style={{ direction: "ltr", textAlign: isArabic ? "right" : "left" }}
        >
          {resetLink}
        </Link>
      </Section>
    </MasterTemplate>
  );
};

export default PasswordResetEmail;
