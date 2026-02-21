"use server";

import { createServerClient } from "../supabase/createServerClient";
import { sendEmail } from "./email";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import { siteConfig } from "../config/site";
import { getUserProfileByEmail } from "./get-user-action";

// ===============================================================================
// File Name: forgot-password.ts
// Description: Forgot Password Management Actions
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
// Generate Password Reset Link Action
// ===============================================================================
export type GeneratePasswordResetLinkPayload = {
  email: string;
  locale: "ar" | "en" | undefined;
};

// =============================================================================
// Generate Password Reset Link Action
// =============================================================================
export async function generatePasswordResetLink(
  payload: GeneratePasswordResetLinkPayload,
): Promise<ApiResponse<string>> {
  try {
    // Get user by email to ensure they exist before generating a reset token
    const { data: user, error: userError } = await getUserProfileByEmail(
      payload.email,
    );

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      // Don't reveal whether the email exists or not for security reasons
      // Delay the response to mitigate brute-force attempts
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Return a generic success message to prevent email enumeration
      return {data: "If an account with that email exists, a reset link has been sent."};
    }

    const userId = user.id;

    // Create a Supabase Server client
    const supabase = await createServerClient();

    // Remove expired tokens before creating a new one
    await supabase.rpc("cleanup_expired_tokens");

    // Generate a unique token and set expiration time (1 hour)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save the token in the database Using a Supabase RPC to ensure atomicity
    const { error: insertError } = await supabase.rpc(
      "create_password_reset_token",
      {
        p_user_id: userId,
        p_token: token,
        p_expires_at: expiresAt.toISOString(),
      },
    );

    // Handle potential errors during token creation
    if (insertError) {
      console.error("Error saving reset token:", insertError);
      return { error: "Failed to generate reset link" };
    }

    // Generate the reset link and send it to the user via email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Send the reset link via email
    const { success } = await sendEmail({
      to: payload.email,
      subject: `Password Reset Link from ${siteConfig.name}`,
      react: PasswordResetEmail({
        resetLink: resetUrl,
        userName: "",
        locale: payload.locale,
      }),
    });

    if (!success) {
      const emailError = new Error("Failed to send email");
      console.error("Error sending email:", emailError);
      return { error: "Failed to generate reset link" };
    }

    return { data: "Password reset link sent successfully." };
  } catch (error) {
    console.error("Error generating reset link:", error);
    return { error: "Failed to generate reset link" };
  }
}
