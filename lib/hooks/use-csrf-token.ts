"use client";

// =====================================================
// 🛡️ CSRF Token Provider - React Hook
// =====================================================
// ✅ يقرأ CSRF token من الكوكيز
// ✅ يرفقه تلقائياً مع كل الطلبات
// ✅ متوافق مع Server Actions
// =====================================================

import { useEffect, useState, useCallback } from "react";
import { getCookie } from "@/lib/utils";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

export function useCsrfToken() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const csrfToken = getCookie(CSRF_COOKIE_NAME);
    if (csrfToken) {
      setToken(csrfToken);
    }
  }, []);

  const refreshToken = useCallback(() => {
    const csrfToken = getCookie(CSRF_COOKIE_NAME);
    if (csrfToken) {
      setToken(csrfToken);
    }
  }, []);

  return { token, refreshToken: refreshToken };
}

export function getCsrfHeaders(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const csrfCookie = cookies.find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`));
  const token = csrfCookie?.split("=")[1] || "";

  return token ? { [CSRF_HEADER_NAME]: token } : {};
}

export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = getCsrfHeaders();

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...options.headers,
    },
  });
}
