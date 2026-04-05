"use server"

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendSupportTicketEmail,
  testEmailConnection,
  type Lang,
} from "./service"

// =====================================================
// 📧 Email Server Actions — إجراءات البريد (متعدد اللغات)
// =====================================================
// ⚠️ اللغة تُمرَّر من الصفحة (Caller) ولا تعتمد على جلسة
//    المستخدم — لأن المستخدم قد لا يكون مسجّلاً بعد
//    (مثل: تأكيد البريد، إعادة تعيين كلمة المرور)
// =====================================================

/**
 * إرسال رابط تأكيد البريد
 */
export async function sendVerificationAction(
  email: string,
  fullName: string,
  verificationUrl: string,
  code?: string,
  lang: Lang = "ar"
) {
  return sendVerificationEmail(email, fullName, verificationUrl, code, lang)
}

/**
 * إرسال رابط إعادة تعيين كلمة المرور
 */
export async function sendPasswordResetAction(
  email: string,
  fullName: string,
  resetUrl: string,
  code?: string,
  lang: Lang = "ar"
) {
  return sendPasswordResetEmail(email, fullName, resetUrl, code, lang)
}

/**
 * إرسال بريد ترحيبي
 */
export async function sendWelcomeAction(
  email: string,
  fullName: string,
  lang: Lang = "ar"
) {
  return sendWelcomeEmail(email, fullName, lang)
}

/**
 * إرسال تأكيد الطلب
 */
export async function sendOrderConfirmationAction(
  email: string,
  fullName: string,
  orderNumber: string,
  total: string,
  lang: Lang = "ar"
) {
  return sendOrderConfirmationEmail(
    email,
    fullName,
    orderNumber,
    total,
    undefined,
    lang
  )
}

/**
 * إرسال إشعار تذكرة الدعم
 */
export async function sendSupportTicketAction(
  email: string,
  fullName: string,
  ticketNumber: string,
  subject: string,
  lang: Lang = "ar"
) {
  return sendSupportTicketEmail(
    email,
    fullName,
    ticketNumber,
    subject,
    undefined,
    lang
  )
}

/**
 * اختبار الاتصال (للأدمن فقط)
 */
export async function testEmailConnectionAction(
  testEmail?: string,
  lang: Lang = "ar"
) {
  return testEmailConnection(testEmail, lang)
}
