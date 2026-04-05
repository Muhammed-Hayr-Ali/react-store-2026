// =====================================================
// 🛡️ CSRF Token API Route
// =====================================================
// ✅ يعيد CSRF token في كوكي
// ✅ يستخدمه العملاء قبل إرسال النماذج
// =====================================================

import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/security/csrf";

export async function GET() {
  const token = generateCsrfToken();

  const response = NextResponse.json({ csrfToken: token });

  response.cookies.set("csrf-token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
