"use client"
import * as React from "react"
import { useLocale } from "next-intl"
import { redirect, usePathname } from "next/navigation"
import { Languages } from "lucide-react"

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
