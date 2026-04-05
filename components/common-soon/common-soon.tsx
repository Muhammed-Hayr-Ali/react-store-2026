"use client"

import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "../notifications"
import { useAuth } from "@/lib/providers/auth-provider"

export default function ComingSoonPage() {
  const t = useTranslations("HomePage")
  const { user } = useAuth();

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center gap-8 overflow-hidden px-4 py-8 text-center">
      {user && <NotificationBell userId={user.id} />}
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="animate-spin-slow absolute -inset-full"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, #FEE3D0, #D5E6FF, #FEE3D0)",
          }}
        />
      </div>

      {/* <div className="absolute top-4 right-4 space-x-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div> */}
      <div className="flex flex-col items-center gap-6">
        <Badge
          variant="secondary"
          className="bg-background/50 px-4 py-1.5 text-sm"
        >
          {t("titlePart1")}
        </Badge>

        <h1 className="pt-4 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {t("titlePart2")}
        </h1>

        <p className="max-w-xl text-sm text-balance text-muted-foreground md:text-base lg:text-lg">
          {t("subtitle")}
        </p>
      </div>

      <Button variant="outline" disabled className="text-sm md:text-base">
        {t("footer")}
      </Button>
    </div>
  );
}
