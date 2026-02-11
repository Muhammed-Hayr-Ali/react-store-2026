"use client";

import { LoginPage } from "@/components/auth/login-page";

// المكون الرئيسي للصفحة
export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <LoginPage />
    </div>
  );
}
