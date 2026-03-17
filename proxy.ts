import createMiddleware from "next-intl/middleware";
import { siteConfig } from "@/lib/config/site_config";

export default createMiddleware({
  // All supported locales
  locales: siteConfig.locales,

  // Default locale when no locale is detected
  defaultLocale: siteConfig.defaultLocale,

  // Use "never" to hide locale prefix from URL
  localePrefix: "never",

  // Enable locale detection to allow switching via NEXT_LOCALE cookie
  localeDetection: true,
});

export const config = {
  // Match all paths except API, static files, images, and favicons
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
