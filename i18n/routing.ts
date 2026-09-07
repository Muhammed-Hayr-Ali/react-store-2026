import { appConfig } from "@/lib/config/app_config"
import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: appConfig.locales,

  // Used when no locale matches
  defaultLocale: appConfig.defaultLocale,

  localePrefix: appConfig.localePrefix as "always" | "never" | "as-needed",
})
