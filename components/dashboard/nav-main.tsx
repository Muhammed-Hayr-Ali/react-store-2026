"use client"

import * as React from "react"
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
import { sidebarConfig } from "./sidebar-config"
import { appRoutes } from "@/lib/config/app-routes"

interface NavMainProps {
  permissions?: string[]
}

export function NavMain({ permissions = [] }: NavMainProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const hasPermission = (requiredPerm?: string) => {
    if (!requiredPerm) return true
    return permissions.includes(requiredPerm)
  }

  const filteredItems = sidebarConfig.navMain
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
    .filter((item) => !item.items || item.items.length > 0)

  const segments = pathname.split("/").filter(Boolean)
  const hasLocale = segments.length > 0 && segments[0].length === 2
  const normalizedPath = hasLocale
    ? `/${segments.slice(1).join("/")}`
    : pathname

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredItems.map((item, index) => {
          const hasChildren = Boolean(item.items && item.items.length > 0)
          const hasActiveChild = item.items?.some(
            (sub) => normalizedPath === sub.url
          )
          const isSingleActive =
            !hasChildren &&
            (item.url === appRoutes.dashboard.user.overview ||
            item.url === appRoutes.dashboard.admin.overview
              ? normalizedPath === item.url
              : normalizedPath === item.url ||
                normalizedPath.startsWith(`${item.url}/`))
          const IconComponent = item.icon

          const isLastItem = index === filteredItems.length - 1

          return (
            <React.Fragment key={item.title}>
              <Collapsible
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
                  <SidebarMenuItem>
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

              {/* لن يظهر الخط الفاصل أبداً إذا كان العنصر في نهاية القائمة */}
              {item.hasSeparator && !isLastItem && (
                <div className="my-2 h-px bg-border" />
              )}
            </React.Fragment>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
