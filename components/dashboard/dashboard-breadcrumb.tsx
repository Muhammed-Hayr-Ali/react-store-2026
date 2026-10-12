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

// قائمة المسارات أو البوادئ البرمجية المخفية من شريط التنقل
const HIDDEN_SEGMENTS = new Set(["x9k2-panel", "team"])

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
  create: "CREATE",
  edit: "EDIT",
}

export default function DashboardBreadcrumb() {
  const t = useTranslations("DashboardBreadcrumb")
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  // تجريد المسار وحساب الروابط التراكمية مع استبعاد المسارات المخفية والمعرّفات (IDs)
  const visibleItems = React.useMemo(() => {
    const rawSegments = pathname
      .split("/")
      .filter(Boolean)
      .filter((seg) => seg !== locale)

    const items: { segment: string; href: string }[] = []

    rawSegments.forEach((segment, idx) => {
      // بناء المسار التراكمي الفعلي حتى لا تنكسر الروابط اللاحقة (حتى لو تم إخفاء العنصر)
      const fullHref = `/${locale}/${rawSegments.slice(0, idx + 1).join("/")}`

      // فحص ما إذا كان الجزء الحالي عبارة عن UUID (معرّف قاعدة البيانات)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment
        )

      // استبعاد الأجزاء المخفية والمعرّفات
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
