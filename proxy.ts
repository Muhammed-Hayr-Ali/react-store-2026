import createMiddleware from "next-intl/middleware"
import { siteConfig } from "./lib/config/site_config"

/**
 * Next.js Internationalization Middleware
 *
 * Features:
 * - Detects user locale from cookie or Accept-Language header
 * - Hides locale from URL (localePrefix: "never")
 * - Sets NEXT_LOCALE cookie based on detection
 * - Excludes static files, API routes, and media files
 *
 * How it works:
 * 1. Checks for NEXT_LOCALE cookie first
 * 2. Falls back to Accept-Language header
 * 3. Uses defaultLocale if no match found
 * 4. Locale is stored internally, not shown in URL
 *
 * Example:
 * - User visits: https://example.com/
 * - Detected locale: "ar" (from cookie or browser)
 * - URL stays: https://example.com/ (not /ar/)
 * - Content is served in Arabic
 */
export default createMiddleware({
  locales: siteConfig.locales,
  defaultLocale: siteConfig.defaultLocale,
  localePrefix: "never",
  localeDetection: true,
})

// Next.js Configuration for Middleware
export const config = {
  /**
   * Matcher for middleware execution
   *
   * This regex matches all paths EXCEPT:
   * - api: API routes (/api/*)
   * - trpc: tRPC routes (/trpc/*)
   * - _next: Next.js internals (/_next/*)
   * - _vercel: Vercel internals (/_vercel/*)
   * - .*\\..*: Files with extensions (images, fonts, manifest, etc.)
   *
   * Examples of EXCLUDED paths (middleware won't run):
   * - /api/auth/signin
   * - /trpc/users
   * - /_next/static/chunks/main.js
   * - /favicon.ico
   * - /manifest.json
   * - /logo.png
   *
   * Examples of INCLUDED paths (middleware WILL run):
   * - /
   * - /comingsoon
   * - /sign-in
   * - /dashboard
   * - /products/123
   */
  matcher: [
    // Match all paths except static files and API routes
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
  ],
}
