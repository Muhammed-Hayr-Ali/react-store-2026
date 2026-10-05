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

// قاموس مسميات المسارات لعرض أسماء أنيقة بدلاً من الكلمات الإنجليزية الخام
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

  // تجريد المسار من الـ locale والحصول على أجزاء المسار
  const segments = React.useMemo(() => {
    return pathname
      .split("/")
      .filter(Boolean)
      .filter((seg) => seg !== locale)
  }, [pathname, locale])

  if (segments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          // بناء مسار الرابط مع الـ locale
          const href = `/${locale}/${segments.slice(0, index + 1).join("/")}`
          const label =
            routeLabels[segment] ||
            segment.charAt(0).toUpperCase() +
              segment.slice(1).replace(/-/g, " ")

          return (
            <React.Fragment key={segment}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem
                className={index === 0 && !isLast ? "hidden md:block" : ""}
              >
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
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
