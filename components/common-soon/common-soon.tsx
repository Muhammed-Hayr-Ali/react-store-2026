"use client"

import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ComingSoonPage() {
  const t = useTranslations("HomePage")

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-8 overflow-hidden bg-background px-4 py-8 text-center">
      <div className="flex flex-col items-center gap-6">
        <Badge variant="secondary" className="px-3">
          {t("titlePart1")}
        </Badge>

        <h1 className="text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl pt-4">
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
