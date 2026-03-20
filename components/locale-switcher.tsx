"use client"

import { useLocale } from "next-intl"
import { redirect, usePathname } from "next/navigation"
import { LanguagesIcon } from "@/components/shared/icons"

import { Button } from "@/components/ui/button"


export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  function toggleLocale() {
    const nextLocale = locale === "en" ? "ar" : "en"

    redirect(`/${nextLocale}${pathname}`)
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleLocale}>
      <LanguagesIcon className="h-5 w-5" />
      <span className="sr-only">Change language</span>
    </Button>
  )
}
