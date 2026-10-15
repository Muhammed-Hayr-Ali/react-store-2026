import { hasLocale } from "next-intl"

import { routing, type AppLocale } from "@/i18n/routing"

export function resolveEmailLocale(locale?: string): AppLocale {
  return hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale
}
