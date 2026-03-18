"use server"

import { PasswordResetEmail } from "../templates/PasswordResetEmail"
import { VerificationEmail } from "../templates/VerificationEmail"
import { WelcomeEmail } from "../templates/WelcomeEmail"
import { sendEmail } from "./sendEmail"


/**
 * إرسال بريد ترحيبي للمستخدم الجديد
 */
export async function sendWelcomeEmailAction(userName: string, userEmail: string) {
  const { subject, html, text } = WelcomeEmail({ userName })

  return await sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  })
}

/**
 * إرسال بريد التحقق من البريد الإلكتروني
 */
export async function sendVerificationEmailAction(
  userEmail: string,
  code: string,
  userName?: string
) {
  const { subject, html, text } = VerificationEmail({ code, userName })

  return await sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  })
}

/**
 * إرسال بريد إعادة تعيين كلمة المرور
 */
export async function sendPasswordResetEmailAction(
  userName: string,
  userEmail: string,
  resetLink: string
) {
  const { subject, html, text } = PasswordResetEmail({ userName, resetLink })

  return await sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  })
}
