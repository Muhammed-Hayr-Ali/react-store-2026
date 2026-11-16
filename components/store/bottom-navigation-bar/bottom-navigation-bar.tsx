/**
 * @file components/store/bottom-navigation-bar.tsx
 * @description Floating mobile bottom notch with search and menu triggers.
 */

"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import React from "react"
import MenuButton from "@/components/ui/menu_button"

export default function BottomNavigationBar() {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)

  return (
    <nav className="flex h-11 items-center justify-between gap-6 rounded-full border border-border/40 bg-background/80 px-5 shadow-lg backdrop-blur-md">
      {/* Search Trigger Button with "Find" label */}
      <Link
        href="/search"
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Search className="size-4" />
        <span>Find</span>
      </Link>

      {/* Divider line between search and menu */}
      <div className="h-4 w-px bg-border/60" aria-hidden="true" />

      {/* Menu Toggle / Action Button */}
      <MenuButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground"
      />
    </nav>
  )
}

// "use client"

// /**
//  * @file components/store/bottom-navigation-bar.tsx
//  * @description Mobile bottom navigation bar with active route detection and internationalization support.
//  */

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { useLocale, useTranslations } from "next-intl"
// import { BOTTOM_NAV_BAR } from "./bottom-navigation-bar-config"
// import { cn } from "@/lib/utils"
// import { Can } from "@/components/shared/can"

// const NAV_LABELS: Record<string, string> = {
//   ar: "التنقل الرئيسي",
//   en: "Main navigation",
//   tr: "Ana gezinme",
//   de: "Hauptnavigation",
// }

// export default function BottomNavigationBar() {
//   const t = useTranslations("BottomNavigationBar")
//   const pathname = usePathname()
//   const locale = useLocale()

//   const localePrefix = `/${locale}`
//   const pathWithoutLocale =
//     pathname === localePrefix
//       ? "/"
//       : pathname.startsWith(`${localePrefix}/`)
//         ? pathname.slice(localePrefix.length)
//         : pathname

//   const currentPath = pathWithoutLocale.replace(/\/+$/, "") || "/"

//   return (
//     <nav
//       aria-label={NAV_LABELS[locale] ?? NAV_LABELS.en}
//       className="w-full shrink-0 pb-[env(safe-area-inset-bottom)] md:hidden"
//     >
//       <div className="mx-auto max-w-6xl px-4">
//         <div className="flex h-14 items-stretch">
//           {BOTTOM_NAV_BAR.map((item) => {
//             const href = `/${locale}${item.url === "/" ? "" : item.url}`

//             const isActive =
//               item.url === "/"
//                 ? currentPath === "/"
//                 : currentPath === item.url ||
//                   currentPath.startsWith(`${item.url}/`)

//             const linkContent = (
//               <Link
//                 key={item.key}
//                 href={href}
//                 aria-current={isActive ? "page" : undefined}
//                 className={cn(
//                   "relative flex h-full flex-1 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-medium select-none active:scale-95",
//                   isActive
//                     ? "font-semibold text-primary"
//                     : "text-muted-foreground hover:text-primary"
//                 )}
//               >
//                 {/* Active tab indicator */}
//                 <span
//                   aria-hidden
//                   className={cn(
//                     "absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-all duration-300",
//                     isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
//                   )}
//                 />
//                 <item.icon
//                   aria-hidden
//                   className="size-4"
//                   strokeWidth={isActive ? 2.25 : 2}
//                 />
//                 <span>
//                   {t(item.label, {
//                     default: item.label,
//                   })}
//                 </span>
//               </Link>
//             )

//             if (item.requiredPermission != undefined) {
//               return (
//                 <Can key={item.key} permission={item.requiredPermission}>
//                   {linkContent}
//                 </Can>
//               )
//             }

//             return linkContent
//           })}
//         </div>
//       </div>
//     </nav>
//   )
// }
