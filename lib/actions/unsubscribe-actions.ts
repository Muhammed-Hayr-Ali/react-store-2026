// lib\actions\unsubscribe-actions.ts






"use server";
import { UnsubscribeResult } from "@/lib/types/others";
import jwt from "jsonwebtoken";
import { createServerClient } from "../supabase/createServerClient";

export async function unsubscribeFromNewsletter(
  token: string,
  reason: string,
): Promise<UnsubscribeResult> {
  console.log(token);

  const supabase = await createServerClient();
  const secret = process.env.NEWSLETTER_JWT_SECRET;

  if (!secret) {
    console.error("JWT secret for newsletter is not set.");
    return { data: null, error: { message: "Server configuration error." } };
  }

  try {
    // 1. التحقق من صحة التوكن واستخراج البريد الإلكتروني
    const payload = jwt.verify(token, secret) as { email: string };
    const email = payload.email;

    // 2. تحديث سجل المستخدم في قاعدة البيانات
    const { error } = await supabase
      .from("newsletter_subscriptions")
      .update({
        status: "unsubscribed",
        unsubscribe_reason: reason,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email)
      .eq("status", "subscribed"); // فقط قم بإلغاء اشتراك المشتركين بالفعل

    if (error) {
      console.error("Unsubscribe DB Error:", error);
      return {
        data: null,
        error: { message: "Could not process your request." },
      };
    }

    // يمكنك هنا أيضًا إرسال بريد إلكتروني لتأكيد إلغاء الاشتراك إذا أردت
    // await sendEmail({ to: email, subject: "Unsubscription Confirmed", ... });

    return {
      data: { message: "You have been successfully unsubscribed." },
      error: null,
    };
  } catch (err) {
    // 3. معالجة أخطاء التوكن (منتهي الصلاحية، غير صالح)
    if (err instanceof jwt.TokenExpiredError) {
      return {
        data: null,
        error: {
          message:
            "This unsubscribe link has expired. Please request a new one.",
        },
      };
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return {
        data: null,
        error: { message: "This unsubscribe link is invalid." },
      };
    }

    console.error("Unsubscribe Token Error:", err);
    return { data: null, error: { message: "An unexpected error occurred." } };
  }
}
