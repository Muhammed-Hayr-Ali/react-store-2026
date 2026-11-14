"use client"

/**
 * @file components/store/bottom-navigation-bar.tsx
 * @description Mobile bottom navigation bar with active route detection and internationalization support.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { BOTTOM_NAV_BAR } from "./bottom-navigation-bar-config"
import { cn } from "@/lib/utils"

const NAV_LABELS: Record<string, string> = {
  ar: "التنقل الرئيسي",
  en: "Main navigation",
  tr: "Ana gezinme",
  de: "Hauptnavigation",
}

export default function BottomNavigationBar() {
  const t = useTranslations("BottomNavigationBar")
  const pathname = usePathname()
  const locale = useLocale()

  // إزالة بادئة الـ locale الفعلية فقط — بدل تخمينها من طول المقطع (was: length === 2)
  const localePrefix = `/${locale}`
  const pathWithoutLocale =
    pathname === localePrefix
      ? "/"
      : pathname.startsWith(`${localePrefix}/`)
        ? pathname.slice(localePrefix.length)
        : pathname

  // توحيد المسار: بدون شرطة مائلة نهائية، والصفحة الرئيسية دائماً "/"
  const currentPath = pathWithoutLocale.replace(/\/+$/, "") || "/"

  return (
    <nav
      aria-label={NAV_LABELS[locale] ?? NAV_LABELS.en}
      className="sticky bottom-0 z-50 w-full border-t border-border/40 bg-background pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-colors supports-backdrop-filter:bg-background/80 md:hidden"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-stretch">
          {BOTTOM_NAV_BAR.map((item) => {
            // دمج الـ locale مع مسار العنصر ليعمل التنقل بشكل صحيح مع next-intl
            const href = `/${locale}${item.url === "/" ? "" : item.url}`

            // تفعيل التبويب للمسارات المتفرعة أيضاً (مثل /products/123)
            const isActive =
              item.url === "/"
                ? currentPath === "/"
                : currentPath === item.url ||
                  currentPath.startsWith(`${item.url}/`)

            return (
              <Link
                key={item.key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-1 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-medium transition-[color,transform] duration-200 select-none active:scale-95",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {/* مؤشر التبويب النشط — إشارة غير لونية besides اللون */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-all duration-300",
                    isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                  )}
                />
                <item.icon
                  aria-hidden
                  className="size-4"
                  strokeWidth={isActive ? 2.25 : 2}
                />
                <span className="">{t(item.label)}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
