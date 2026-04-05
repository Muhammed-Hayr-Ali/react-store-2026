"use client";

// =====================================================
// 🛡️ CSRF Token Provider - Context + Hook
// =====================================================
// ✅ يجلب CSRF token عند تحميل التطبيق
// ✅ يخزنه في Context لكل المكونات
// ✅ يرفقه مع كل Server Actions
// =====================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type CsrfContextValue = {
  token: string;
  refresh: () => Promise<void>;
};

const CsrfContext = createContext<CsrfContextValue>({
  token: "",
  refresh: async () => {},
});

export function useCsrf() {
  return useContext(CsrfContext);
}

export function CsrfProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/csrf-token", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.csrfToken);
      }
    } catch {
      console.warn("Failed to fetch CSRF token");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CsrfContext value={{ token, refresh }}>
      {children}
    </CsrfContext>
  );
}
