// lib/newsletter/actions.ts

"use server";

import React from "react";
import { sendEmail } from "@/lib/actions/email";
import { createUnsubscribeLink } from "./jwt"; // استيراد دالة إنشاء الرابط من ملفها الصحيح
import { createServerClient } from "@/lib/supabase/createServerClient";
import NewsletterConfirmationEmail from "@/emails/newsletter-confirmation-email";
import { getLocale } from "next-intl/server";
import jwt from "jsonwebtoken";

// ===============================================================================
// File Name: newsletter.ts
// Description: Newsletter Management Actions.
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-03-14
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Api Response Type
// ================================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  [key: string]: unknown;
};

// ==============================================================================
// Subscribe to Newsletter Action
// ==============================================================================
export async function subscribeToNewsletter(
  email: string,
): Promise<ApiResponse<string>> {
  const locale = await getLocale();
  // Create a Supabase Server client
  const supabase = await createServerClient();

  // Insert or update the subscription in the database
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
    console.error("Error subscribing to newsletter:", error);
    return {
      error: "Failed to subscribe to newsletter. Please try again later.",
    };
  }

  try {
    const unsubscribeUrl = createUnsubscribeLink(email);

    await sendEmail({
      to: email,
      subject:
        locale === "ar"
          ? "اشترك في النشرة البريدية"
          : "Newsletter Subscription",
      react: React.createElement(NewsletterConfirmationEmail, {
        userName: email,
        unsubscribeUrl: unsubscribeUrl,
        locale: locale as "ar" | "en",
      }),
    });
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
  }

  return {
    data: "Successfully subscribed to newsletter",
  };
}



// ================================================================================
// Unsubscribe From Newsletter
// ================================================================================
export async function unsubscribeFromNewsletter(
  token: string,
  reason: string,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client
  const supabase = await createServerClient();

  // Initialize JWT secret
  const secret = process.env.NEWSLETTER_JWT_SECRET;

  if (!secret) {
    console.error("JWT secret for newsletter is not set.");
    return { error: "Could not process your request." };
  }

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
    .eq("email", email);

  if (error) {
    console.error("Unsubscribe DB Error:", error);
    return { error: "Could not process your request." };
  }

  return {
    data: true,
  };
}





