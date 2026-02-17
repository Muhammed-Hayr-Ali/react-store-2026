"use client";

import { AuthResponse, User } from "@supabase/supabase-js";
import { generateRandomCode } from "./generate-discount-code";
import { createDiscountCode } from "./discounts";
import { sendEmail } from "./email";
import WelcomeEmail from "@/emails/welcome-email";
import { createBrowserClient } from "../supabase/createBrowserClient";
import { ApiResponse } from "../types";

// ===============================================================================
// File Name: auth.ts
// Description: Authantication Management Actions
// status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-010
// Version: 1.0
// Copyright (c) 2023 Mohammed Kher Ali
// ===============================================================================



// ===============================================================================
// Sign Up Payload
// ===============================================================================
export interface SignUpPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  locale: string;
}

// ===============================================================================
// Sign Up With Password & Generate Welcome Discount Code & Send Welcome Email
// ===============================================================================
export async function signUpWithPassword({
  first_name,
  last_name,
  email,
  password,
  locale,
}: SignUpPayload): Promise<ApiResponse<User | null>> {
  const supabase = createBrowserClient();

  // Try to sign up the user
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

  if (signUpError || !signUpData || !signUpData.user) {
    console.error("Error signing up:", signUpError);
    return {
      error: signUpError?.message || "User registration failed unexpectedly.",
    };
  }

  const user = signUpData.user;

  // Generate a welcome discount code
  const welcomeDiscountCode = `WELCOME-${generateRandomCode(6)}`;

  // Create a new discount code
  const discountPayload = {
    code: welcomeDiscountCode,
    discount_type: "percentage" as const,
    discount_value: 10,
    usage_limit: 1,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // ينتهي بعد 30 يومًا
  };

  // Create the discount code for the new user
  const { error: discountError } = await createDiscountCode(discountPayload);

  if (discountError) {
    console.error("Error creating discount code:", discountError);
    return {
      error: discountError || "Failed to create discount code.",
    };
  }

  // Send welcome email to the user
  const { success: emailSuccess } = await sendEmail({
    to: email,
    subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}! 🎉`,
    react: WelcomeEmail({
      userName: `${first_name} ${last_name}`,
      discountCode: welcomeDiscountCode,
      locale: locale as "ar" | "en",
    }),
  });

  if (!emailSuccess) {
    return {
      error: "Failed to send welcome email. Please try again.",
    };
  }

  // Return the user
  return { data: user };
}

// ===============================================================================
// Sign In With Password
// ===============================================================================
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse["data"] | null | null>> {
  const supabase = createBrowserClient();
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !data) {
    return {
      error: signInError?.message || "Sign in failed.",
      mfaData: null,
    };
  }

  return { data };
}

// ===============================================================================
// Sign Out User
// ===============================================================================
export async function signOut(): Promise<ApiResponse<null>> {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    return { error: error.message };
  }
  return { data: null };
}
