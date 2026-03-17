import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"
import { siteConfig } from "@/lib/config/site_config"

export const routing = defineRouting({
  locales: siteConfig.locales,
  defaultLocale: siteConfig.defaultLocale,
  localePrefix: "never",
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
