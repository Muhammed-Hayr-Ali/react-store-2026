"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// قائمة المسارات أو البوادئ البرمجية المخفية من شريط التنقل
const HIDDEN_SEGMENTS = new Set(["x9k2-panel"])

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  brands: "Brands",
  orders: "Orders",
  roles: "Roles",
  "staff-access": "Staff Access",
  "flash-sales": "Flash Sales",
  reports: "Reports",
  users: "Users",
  create: "Create",
  edit: "Edit",
}

export default function DashboardBreadcrumb() {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || "en"

  // تجريد المسار وحساب الروابط التراكمية مع استبعاد المسارات المخفية
  const visibleItems = React.useMemo(() => {
    const rawSegments = pathname
      .split("/")
      .filter(Boolean)
      .filter((seg) => seg !== locale)

    const items: { segment: string; href: string }[] = []

    rawSegments.forEach((segment, idx) => {
      // بناء المسار التراكمي الفعلي حتى لا تنكسر الروابط اللاحقة
      const fullHref = `/${locale}/${rawSegments.slice(0, idx + 1).join("/")}`

      if (!HIDDEN_SEGMENTS.has(segment)) {
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
            routeLabels[item.segment] ||
            item.segment.charAt(0).toUpperCase() +
              item.segment.slice(1).replace(/-/g, " ")

          return (
            <React.Fragment key={item.segment}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem
                className={index === 0 && !isLast ? "hidden md:block" : ""}
              >
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
