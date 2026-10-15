"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Route segments omitted from the dashboard breadcrumb.
const HIDDEN_SEGMENTS = new Set(["x9k2-panel", "team"])

// Translation keys for known route segments.
const routeLabelKeys: Record<string, string> = {
  dashboard: "DASHBOARD",
  products: "PRODUCTS",
  categories: "CATEGORIES",
  brands: "BRANDS",
  orders: "ORDERS",
  roles: "ROLES",
  "staff-access": "STAFF_ACCESS",
  "flash-sales": "FLASH_SALES",
  reports: "REPORTS",
  users: "USERS",
  "newsletter-subscribers": "NEWSLETTER_SUBSCRIBERS",
  create: "CREATE",
  edit: "EDIT",
}

export default function DashboardBreadcrumb() {
  // Resolve the current route, locale, and translated labels.
  const t = useTranslations("DashboardBreadcrumb")
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  // Build cumulative breadcrumb links while excluding hidden and ID segments.
  const visibleItems = React.useMemo(() => {
    const rawSegments = pathname
      .split("/")
      .filter(Boolean)
      .filter((seg) => seg !== locale)

    const items: { segment: string; href: string }[] = []

    rawSegments.forEach((segment, idx) => {
      // Preserve the full route path even when a segment is hidden from display.
      const fullHref = `/${locale}/${rawSegments.slice(0, idx + 1).join("/")}`

      // Detect UUID segments used as database record identifiers.
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment
        )

      // Keep only route segments that should appear in the breadcrumb.
      if (!HIDDEN_SEGMENTS.has(segment) && !isUUID) {
        items.push({
          segment,
          href: fullHref,
        })
      }
    })

    return items
  }, [pathname, locale])

  if (visibleItems.length === 0) return null

  // Render linked ancestors and the current page label.
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1
          const label =
            (routeLabelKeys[item.segment]
              ? t(routeLabelKeys[item.segment])
              : null) ||
            item.segment.charAt(0).toUpperCase() +
              item.segment.slice(1).replace(/-/g, " ")

          return (
            <React.Fragment key={item.segment}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
