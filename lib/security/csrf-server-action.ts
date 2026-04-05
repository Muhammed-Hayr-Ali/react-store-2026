"use server";

// =====================================================
// 🛡️ CSRF Token Verification for Server Actions
// =====================================================
// ✅ يتحقق من CSRF token في Server Actions
// ✅ يمنع الطلبات المزورة
// =====================================================

import { cookies } from "next/headers";

export async function verifyCsrfToken(formData: FormData): Promise<{
  valid: boolean;
  error?: string;
}> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("csrf-token")?.value;
  const formToken = formData.get("csrfToken") as string;

  if (!cookieToken) {
    return {
      valid: false,
      error: "CSRF cookie not found",
    };
  }

  if (!formToken) {
    return {
      valid: false,
      error: "CSRF token not found in form",
    };
  }

  if (cookieToken !== formToken) {
    return {
      valid: false,
      error: "CSRF token mismatch",
    };
  }

  return { valid: true };
}
