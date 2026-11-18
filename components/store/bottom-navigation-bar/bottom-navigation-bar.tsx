/**
 * @file components/store/bottom-navigation-bar.tsx
 * @description Floating mobile bottom navigation bar with customized active/inactive state icons.
 */

"use client"

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

  const localePrefix = `/${locale}`
  const pathWithoutLocale =
    pathname === localePrefix
      ? "/"
      : pathname.startsWith(`${localePrefix}/`)
        ? pathname.slice(localePrefix.length)
        : pathname

  const currentPath = pathWithoutLocale.replace(/\/+$/, "") || "/"

  return (
    <nav
      aria-label={NAV_LABELS[locale] ?? NAV_LABELS.en}
      className="fixed inset-x-0 bottom-0 z-50 w-full shrink-0 border-t border-border/40 bg-background pb-[env(safe-area-inset-bottom)] shadow-lg md:hidden"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-stretch">
          {BOTTOM_NAV_BAR.map((item) => {
            const href = `/${locale}${item.url === "/" ? "" : item.url}`

            const isActive =
              item.url === "/"
                ? currentPath === "/"
                : currentPath === item.url ||
                  currentPath.startsWith(`${item.url}/`)

            const IconComponent = item.icon

            return (
              <Link
                key={item.key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-1 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-medium transition-colors select-none active:scale-95",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {/* Active tab indicator line */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-all duration-300",
                    isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                  )}
                />

                {/* تمرير الـ status كـ boolean لتغيير لون وشكل الأيقونة تلقائياً */}
                <IconComponent aria-hidden status={isActive} size="xs" />

                <span>
                  {t(item.label, {
                    default: item.label,
                  })}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
