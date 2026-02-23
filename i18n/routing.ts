import { siteConfig } from "@/lib/config/site";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["ar", "en"],

  // Used when no locale matches
  defaultLocale: siteConfig.defaultLocale as "en" | "ar",

  // Strategy for locale prefixes in URLs
  localePrefix: "as-needed",
});
