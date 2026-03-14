// src/components/site-logo.tsx
"use client";

import { siteConfig } from "@/lib/config/site";
import { Logo } from "./icons";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  withoutText?: boolean;
}

export function AppLogo({
  size = "md",
  withoutText = true,
}: AppLogoProps) {
  // تحديد الأحجام حسب الحالة
  const sizeConfig = {
    sm: { textSize: "text-lg", logoSize: 20 },
    md: { textSize: "text-xl", logoSize: 24 },
    lg: { textSize: "text-2xl", logoSize: 30 },
  };

  const {logoSize } = sizeConfig[size];

  return (
    <>
      <Logo size={logoSize} />
      {withoutText ? null : <span> {siteConfig.name}</span>}
      <span className="sr-only">{siteConfig.name}.</span>
    </>
  );
}
