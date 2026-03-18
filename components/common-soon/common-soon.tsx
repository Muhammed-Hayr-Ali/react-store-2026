"use client"

import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LocaleSwitcher } from "../locale-switcher"
import { ThemeToggle } from "../theme-toggle"

export default function ComingSoonPage() {
  const t = useTranslations("HomePage")

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center gap-8 overflow-hidden px-4 py-8 text-center">
      {/* Animated Gradient Background */}
      <div className="animate-gradient-rotate absolute inset-0 -z-10" />

      <div className="absolute top-4 right-4 space-x-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-6">
        <Badge variant="secondary" className="px-3">
          {t("titlePart1")}
        </Badge>

        <h1 className="pt-4 text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          {t("titlePart2")}
        </h1>

        <p className="max-w-105 text-xs text-balance text-muted-foreground md:text-sm lg:text-base">
          {t("subtitle")}
        </p>
      </div>

      <Button variant="outline" disabled className="text-xs md:text-sm">
        {t("footer")}
      </Button>
    </div>
  )
}
