// middleware.ts
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // قائمة بجميع اللغات المدعومة في تطبيقك
  locales: ["en", "ar"],

  // اللغة الافتراضية التي سيتم استخدامها إذا لم يتم تحديد لغة في المسار
  defaultLocale: "en",

  // إظهار اللغة فقط عندما تختلف عن الافتراضية
  // /dashboard (en) vs /ar/dashboard (ar)
  localePrefix: "as-needed", // 'always' | 'never' | 'as-needed'
});

export const config = {
  // يطابق جميع المسارات باستثناء:
  // 1. ملفات API (مثل /api/...)
  // 2. الملفات الثابتة (مثل /_next/static/...)
  // 3. الصور (مثل /_next/image/...)
  // 4. الرموز (مثل /favicon.ico)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
