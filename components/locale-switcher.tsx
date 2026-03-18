"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "@/i18n/routing"

const languages = {
  ar: "العربية",
  en: "English",
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()

  function onSelectChange(nextLocale: string) {
    // Set cookie for locale detection
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`
    // Refresh to load new locale
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([localeCode, name]) => (
          <DropdownMenuItem
            key={localeCode}
            onClick={() => onSelectChange(localeCode)}
            className={locale === localeCode ? "bg-accent" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
