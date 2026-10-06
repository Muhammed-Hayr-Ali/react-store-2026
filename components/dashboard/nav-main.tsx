"use client"

import { ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getSidebarConfigByRole } from "./sidebar-config"
import { appRoutes } from "@/lib/config/app-routes"

interface NavMainProps {
  role?: string
  permissions?: string[] // مصفوفة الصلاحيات القادمة من بيانات المستخدم
}

export function NavMain({ role, permissions = [] }: NavMainProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }


  

  const config = getSidebarConfigByRole(role)

  // دالة فحص ما إذا كان المستخدم يملك الصلاحية المطلوبة
  const hasPermission = (requiredPerm?: string) => {
    if (!requiredPerm) return true // إذا لم تكن هناك صلاحية مطلوبة، يظهر العنصر للجميع
    // إذا كان أدمن خارق مثلاً أو يملك الصلاحية المحددة
    return permissions.includes(requiredPerm)
  }

  // فلترة العناصر الرئيسية والعناصر الفرعية بناءً على صلاحيات المستخدم الفعلية
  const filteredItems = config.navMain
    .filter((item) => hasPermission(item.requiredPermission))
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: item.items.filter((sub) =>
            hasPermission(sub.requiredPermission)
          ),
        }
      }
      return item
    })
    .filter((item) => !item.items || item.items.length > 0) // إزالة الأقسام الفارغة إذا لم يتبقَ فيها شيء

  const segments = pathname.split("/").filter(Boolean)
  const hasLocale = segments.length > 0 && segments[0].length === 2
  const normalizedPath = hasLocale
    ? `/${segments.slice(1).join("/")}`
    : pathname

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const hasChildren = Boolean(item.items && item.items.length > 0)
          const hasActiveChild = item.items?.some(
            (sub) => normalizedPath === sub.url
          )
        const isSingleActive =
          !hasChildren &&
          (item.url === appRoutes.dashboard.home || item.url === appRoutes.dashboard.admin.home
            ? normalizedPath === item.url
            : normalizedPath === item.url ||
              normalizedPath.startsWith(`${item.url}/`))
          const IconComponent = item.icon

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={hasActiveChild}
              className="group/collapsible"
            >
              {hasChildren ? (
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={false}
                      className="font-medium data-[state=open]:text-foreground"
                    >
                      {IconComponent && <IconComponent />}
                      <span>{item.title}</span>
                      <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubActive = normalizedPath === subItem.url

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubActive}
                            >
                              <Link
                                href={subItem.url}
                                onClick={handleLinkClick}
                              >
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    isActive={isSingleActive}
                  >
                    <Link href={item.url} onClick={handleLinkClick}>
                      {IconComponent && <IconComponent />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
