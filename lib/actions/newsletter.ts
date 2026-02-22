// lib/newsletter/actions.ts

"use server";

import React from "react";
import { sendEmail } from "@/lib/actions/email";
import { createUnsubscribeLink } from "./utils"; // استيراد دالة إنشاء الرابط من ملفها الصحيح
import { createServerClient } from "@/lib/supabase/createServerClient";
import NewsletterConfirmationEmail from "@/emails/newsletter-confirmation-email";

// ===============================================================================
// File Name: newsletter.ts
// Description: Newsletter Management Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================

// ===============================================================================
// Api Response Type
// ===============================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// ==============================================================================
// Subscribe to Newsletter Action
// ==============================================================================

export async function subscribeToNewsletter(
  email: string,
  locale: string,
): Promise<ApiResponse<string>> {
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
