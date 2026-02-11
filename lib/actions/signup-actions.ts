"use server";

import { createServerClient } from "../supabase/createServerClient";
import { type User } from "@supabase/supabase-js";
import { createDiscountCode } from "./discounts"; // ✅ استيراد دالة إنشاء كود الخصم
import { sendEmail } from "./email";
import WelcomeEmail from "@/emails/welcome-email";
import { generateRandomCode } from "./generate-discount-code";

export interface SignUpPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  locale: string;
}

export type SignUpResult<T> = {
  data?: T;
  error: string | null;
};



export async function signUpWithPassword({
  first_name,
  last_name,
  email,
  password,
  locale,
}: SignUpPayload): Promise<SignUpResult<User | null>> {
  const supabase = await createServerClient();

  // --- الخطوة 1: تسجيل المستخدم الجديد ---
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      },
    },
  });

  if (signUpError) {
    return { data: null, error: signUpError.message };
  }

  if (!signUpData.user) {
    return { data: null, error: "User registration failed unexpectedly." };
  }

  const user = signUpData.user;

  // --- ✅ الخطوة 2: إنشاء كود الخصم الترحيبي ---
  const welcomeDiscountCode = `WELCOME-${generateRandomCode(6)}`;

  // تعريف خصائص كود الخصم
  const discountPayload = {
    code: welcomeDiscountCode,
    discount_type: "percentage" as const,
    discount_value: 10, // خصم 10%
    usage_limit: 1, // يمكن استخدامه مرة واحدة فقط
    // يمكنك إضافة تاريخ انتهاء صلاحية إذا أردت
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // ينتهي بعد 30 يومًا
  };

  // استدعاء دالة الخادم لإنشاء الكود في قاعدة البيانات
  const { error: discountError } = await createDiscountCode(discountPayload);

  if (discountError) {
    // ماذا نفعل إذا فشل إنشاء كود الخصم؟
    // الخيار 1 (الأكثر أمانًا): لا نوقف العملية، فقط نسجل الخطأ.
    // سيتم إنشاء المستخدم ولكن لن يحصل على كود خصم.
    console.error(
      `Failed to create discount code for new user ${email}:`,
      discountError,
    );
    // الخيار 2 (أكثر صرامة): حذف المستخدم الذي تم إنشاؤه وإرجاع خطأ.
    // await supabase.auth.admin.deleteUser(user.id);
    // return { data: null, error: "Failed to finalize user setup. Please try again." };
  }

  // --- ✅ الخطوة 3: إرسال بريد الترحيب (مع الكود) ---
  // نستمر في إرسال البريد حتى لو فشل إنشاء الكود، ولكن يمكن تغيير هذا السلوك.
  const { success: emailSuccess } = await sendEmail({
    to: email,
    subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}! 🎉`,
    react: WelcomeEmail({
      userName: `${first_name} ${last_name}`,
      discountCode: welcomeDiscountCode,
      locale: locale as "ar" | "en",
    }),
  });


  if(!emailSuccess) {
    return { data: null, error: "Failed to send welcome email. Please try again." };
  }

  // --- الخطوة 4: إرجاع بيانات المستخدم بنجاح ---
  return { data: user, error: null };
}
