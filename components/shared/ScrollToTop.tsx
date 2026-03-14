"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // تأكد من أن الكود يعمل فقط في المتصفح
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }, [pathname]);

  return null;
}
