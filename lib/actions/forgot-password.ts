"use server";

import { createServerClient } from "../supabase/createServerClient";
import { sendEmail } from "./email";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import { siteConfig } from "../config/site";

export type GPRLResponse<T> = {
  data?: T;
  error?: string | null;
};

export async function generatePasswordResetLink(
  userId: string,
  email: string,
  locale: "ar" | "en" | undefined
): Promise<GPRLResponse<null>> {
  try {
    const supabase = await createServerClient();

    await supabase.rpc("cleanup_expired_tokens");

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const { error: insertError } = await supabase.rpc(
      "create_password_reset_token",
      {
        p_user_id: userId,
        p_token: token,
        p_expires_at: expiresAt.toISOString(),
      },
    );

    if (insertError) {
      console.error("Error saving reset token:", insertError);
      return { error: "Failed to generate reset link" };
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    const { success } = await sendEmail({
      to: email,
      subject: `Password Reset Link from ${siteConfig.name}`,
      react: PasswordResetEmail({
        resetLink: resetUrl,
        userName: "",
        locale: locale,
      }),
    });

    if (!success) {
      const emailError = new Error("Failed to send email");
      console.error("Error sending email:", emailError);
      return { error: "Failed to generate reset link" };
    }

    return { error: null };
  } catch (error) {
    console.error("Error generating reset link:", error);
    return { error: "Failed to generate reset link" };
  }
}
