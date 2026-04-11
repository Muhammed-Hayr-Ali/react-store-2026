// =====================================================
// 📧 Email Service — خدمة البريد الإلكتروني (متعدد اللغات)
// =====================================================

import { sendEmail } from "./transporter"
import {
  emailVerificationTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  orderConfirmationTemplate,
  supportTicketTemplate,
  type Lang,
} from "./templates"
export type { Lang } from "./templates"

// ─── Default language helper ──────────────────────────

function resolveLang(lang?: Lang): Lang {
  return lang ?? "ar"
}

// ─── Email Verification ───────────────────────────────

export async function sendVerificationEmail(
  to: string,
  userName: string,
  verificationUrl: string,
  code?: string,
  lang?: Lang
) {
  const l = resolveLang(lang)
  const { html, subject } = emailVerificationTemplate(
    userName,
    verificationUrl,
    code,
    l
  )

  return sendEmail({
    to,
    subject,
    html,
    text:
      l === "ar"
        ? `مرحباً ${userName}، يرجى تأكيد بريدك الإلكتروني: ${verificationUrl}`
        : `Hi ${userName}, please verify your email: ${verificationUrl}`,
  })
}

// ─── Password Reset ───────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetUrl: string,
  code?: string,
  lang?: Lang
) {
  const l = resolveLang(lang)
  const { html, subject } = passwordResetTemplate(userName, resetUrl, code, l)

  return sendEmail({
    to,
    subject,
    html,
    text:
      l === "ar"
        ? `مرحباً ${userName}، رابط إعادة تعيين كلمة المرور: ${resetUrl}`
        : `Hi ${userName}, reset your password: ${resetUrl}`,
  })
}

// ─── Welcome ──────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  userName: string,
  lang?: Lang
) {
  const l = resolveLang(lang)
  const { html, subject } = welcomeTemplate(userName, undefined, l)

  return sendEmail({
    to,
    subject,
    html,
  })
}

// ─── Order Confirmation ───────────────────────────────

export async function sendOrderConfirmationEmail(
  to: string,
  userName: string,
  orderNumber: string,
  total: string,
  orderUrl?: string,
  lang?: Lang
) {
  const l = resolveLang(lang)
  const { html, subject } = orderConfirmationTemplate(
    userName,
    orderNumber,
    total,
    orderUrl,
    l
  )

  return sendEmail({
    to,
    subject,
    html,
    text:
      l === "ar"
        ? `مرحباً ${userName}، تم تأكيد طلبك #${orderNumber} بمبلغ ${total}`
        : `Hi ${userName}, your order #${orderNumber} of ${total} has been confirmed`,
  })
}

// ─── Support Ticket ───────────────────────────────────

export async function sendSupportTicketEmail(
  to: string,
  userName: string,
  ticketNumber: string,
  subject: string,
  ticketUrl?: string,
  lang?: Lang
) {
  const l = resolveLang(lang)
  const { html, subject: emailSubject } = supportTicketTemplate(
    userName,
    ticketNumber,
    subject,
    ticketUrl,
    l
  )

  return sendEmail({
    to,
    subject: emailSubject,
    html,
  })
}

// ─── Test Connection ──────────────────────────────────

export async function testEmailConnection(to?: string, lang?: Lang) {
  const l = resolveLang(lang)
  const recipient = to ?? process.env.EMAIL_FROM

  if (!recipient) {
    return { success: false, error: "No recipient configured" }
  }

  const isAr = l === "ar"

  return sendEmail({
    to: recipient,
    subject: isAr
      ? "✅ اختبار الاتصال — Email Service Test"
      : "✅ Connection Test — Email Service Test",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #667eea;">✅ ${isAr ? "الاتصال يعمل!" : "Connection is working!"}</h1>
        <p>${
          isAr
            ? "تم إرسال هذا البريد بنجاح من خدمة البريد الإلكتروني."
            : "This email was sent successfully from the email service."
        }</p>
        <p><strong>${isAr ? "الوقت" : "Time"}:</strong> ${new Date().toLocaleString(isAr ? "ar-SA" : "en-US")}</p>
        <p><strong>${isAr ? "المستلم" : "Recipient"}:</strong> ${recipient}</p>
        <p><strong>${isAr ? "اللغة" : "Language"}:</strong> ${l === "ar" ? "العربية" : "English"}</p>
      </div>
    `,
  })
}
