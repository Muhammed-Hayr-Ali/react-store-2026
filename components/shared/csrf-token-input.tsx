"use client";

// =====================================================
// 🛡️ CSRF Token Hidden Input
// =====================================================
// ✅ يُضاف داخل كل form
// ✅ يربط CSRF token مع Server Action
// =====================================================

import { useCsrf } from "@/lib/providers/csrf-provider";

export function CsrfTokenInput() {
  const { token } = useCsrf();

  return <input type="hidden" name="csrfToken" value={token} />;
}
