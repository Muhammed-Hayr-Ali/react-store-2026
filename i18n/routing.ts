import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "ar", "tr", "de"],

  // Used when no locale matches
  defaultLocale: "en",

  localePrefix: "never",
})

export type AppLocale = (typeof routing.locales)[number]
