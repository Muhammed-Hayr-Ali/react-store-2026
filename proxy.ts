// middleware.ts
import createMiddleware from "next-intl/middleware";
import { siteConfig } from "./lib/config/site";

export default createMiddleware({
  // قائمة بجميع اللغات المدعومة في تطبيقك
  locales: ["en", "ar", siteConfig.defaultLocale],

  // اللغة الافتراضية التي سيتم استخدامها إذا لم يتم تحديد لغة في المسار
  defaultLocale: siteConfig.defaultLocale,

  // هل يجب أن يكون defaultLocale دائمًا في المسار؟
  // إذا كان false، فإن /en/about ستصبح /about
  localePrefix: "never", // 'always' | 'never' | 'as-needed'
});

export const config = {
  // يطابق جميع المسارات باستثناء:
  // 1. ملفات API (مثل /api/...)
  // 2. الملفات الثابتة (مثل /_next/static/...)
  // 3. الصور (مثل /_next/image/...)
  // 4. الرموز (مثل /favicon.ico)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
