"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { languages } from "@/i18n"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function onSelectChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale })
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
