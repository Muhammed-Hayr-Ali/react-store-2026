// lib/newsletter/actions.ts

"use server";

import React from "react";
import { sendEmail } from "@/lib/actions/email";
import { WelcomeEmail } from "@/emails/welcome-email";
import { createUnsubscribeLink } from "./utils"; // استيراد دالة إنشاء الرابط من ملفها الصحيح
import { createServerClient } from "@/lib/supabase/createServerClient";

// ====================================================================
// 1. دالة الاشتراك في النشرة البريدية
// ====================================================================

export type SubscribeResult = {
  data: { message: string } | null;
  error: { message: string } | null;
};

export async function subscribeToNewsletter(
  email: string,
): Promise<SubscribeResult> {
  const supabase = await createServerClient();

  const { error } = await supabase.from("newsletter_subscriptions").upsert(
    {
      email: email,
      status: "subscribed",
      unsubscribe_reason: null,
      unsubscribed_at: null,
    },
    {
      onConflict: "email",
    },
  );


  if (error) {
    console.log(error);
    console.error("Newsletter Subscription DB Error:", error);
    return {
      data: null,
      error: { message: "An unexpected error occurred. Please try again." },
    };
  }

  // في حالة النجاح، قم بإرسال بريد الترحيب
  try {
    const unsubscribeUrl = createUnsubscribeLink(email);

    await sendEmail({
      to: email,
      subject: "أهلاً بك في Marketna! إليك هديتك 🎁",
      react: React.createElement(WelcomeEmail, {
        discountCode: "WELCOME10", // يمكنك إنشاء كود ديناميكي لاحقًا
        unsubscribeUrl: unsubscribeUrl,
      }),
    });
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
    // لا تفشل عملية الاشتراك بأكملها إذا فشل البريد الإلكتروني.
    // يمكن تسجيل الخطأ للمراجعة لاحقًا.
    // سنرجع رسالة نجاح للمستخدم لأنه تم اشتراكه بالفعل في قاعدة البيانات.
  }

  return {
    data: {
      message:
        "Thank you for subscribing! Please check your inbox for a welcome gift.",
    },
    error: null,
  };
}

