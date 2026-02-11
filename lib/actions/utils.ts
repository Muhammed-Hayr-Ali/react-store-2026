// lib/newsletter/utils.ts

import jwt from "jsonwebtoken";

/**
 * ينشئ رابطًا آمنًا وموقعًا لإلغاء الاشتراك لمستخدم معين.
 * @param email - البريد الإلكتروني للمستخدم لإنشاء الرابط له.
 * @returns رابط URL كامل يحتوي على توكن JWT.
 */
export function createUnsubscribeLink(email: string): string {
  const secret = process.env.NEWSLETTER_JWT_SECRET;

  // 1. التحقق من وجود المفتاح السري في متغيرات البيئة
  if (!secret) {
    console.error("JWT secret for newsletter is not set in .env.local");
    // في حالة عدم وجود السر، لا يمكننا إنشاء رابط آمن
    // من الأفضل إرجاع رابط صفحة المساعدة أو رابط عام بدلاً من رابط معطل
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return `${baseUrl}/contact`; // أو أي صفحة مناسبة
  }

  // 2. إنشاء حمولة (payload ) التوكن
  const payload = { email: email };

  // 3. توقيع التوكن مع تاريخ انتهاء صلاحية (مثلاً: 30 يومًا)
  // هذا يمنع استخدام الروابط القديمة جدًا
  const token = jwt.sign(payload, secret, { expiresIn: "30d" });

  // 4. التأكد من وجود رابط الموقع الأساسي
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // 5. بناء وإرجاع الرابط الكامل
  return `${baseUrl}/unsubscribe?token=${token}`;
}
