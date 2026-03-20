"use client"

import { useLocale } from "next-intl"
import { redirect, usePathname } from "next/navigation"
import { LanguagesIcon } from "@/components/shared/icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = {
  ar: "العربية",
  en: "English",
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  function onSelectChange(nextLocale: string) {
    // ✅ redirect من next-intl تدعم locale بشكل صحيح مع TypeScript
    redirect(`/${nextLocale}${pathname}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <LanguagesIcon className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
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
