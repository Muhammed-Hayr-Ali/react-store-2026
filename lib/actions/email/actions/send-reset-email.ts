"use server"

import { PasswordResetEmail } from "../templates/PasswordResetEmail"
import { sendEmail } from "./sendEmail"


interface SendPasswordResetEmailOptions {
  email: string
  resetLink: string
  expiresInMinutes?: number
}

/**
 * إرسال بريد إلكتروني لإعادة تعيين كلمة المرور
 */
export async function sendPasswordResetEmail({
  email,
  resetLink,
  expiresInMinutes = 60,
}: SendPasswordResetEmailOptions) {
  const { subject, html, text } = PasswordResetEmail({
    userName: "",
    resetLink,
    companyName: "MarketNA",
    expiresInMinutes,
  })

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}
