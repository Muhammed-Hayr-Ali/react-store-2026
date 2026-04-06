// i18n/routing.ts
import { siteConfig } from "@/lib/config/site_config";
import { defineRouting } from "next-intl/routing";

/**
 * Routing Configuration for next-intl
 *
 * This configuration is shared between:
 * - Middleware (proxy.ts): Detects and sets locale
 * - Navigation: Creates locale-aware links
 * - Server Components: Gets current locale
 *
 * Key Settings:
 * - localePrefix: "never" = Hide locale from URL (https://example.com/)
 * - localePrefix: "as-needed" = Show only when different from default (https://example.com/en/)
 * - localePrefix: "always" = Always show locale (https://example.com/ar/)
 */
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: siteConfig.locales,

  // Used when no locale matches
  defaultLocale: siteConfig.defaultLocale,

  // IMPORTANT: Show locale in URL only when different from default
  // /dashboard (en) vs /ar/dashboard (ar)
  localePrefix: "as-needed",
});
