"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
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

interface NavItemProps {
  role?: string
}

export function NavMain({ role }: NavItemProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // استخراج قائمة items مباشرة من الـ config لأن الدالة تعيد كائن SidebarConfig
  const config = getSidebarConfigByRole(role)
  const items = config.navMain

  // تجريد بادئة اللغة إن وجدت (مثل /ar/dashboard -> /dashboard)
  const segments = pathname.split("/").filter(Boolean)
  const hasLocale = segments.length > 0 && segments[0].length === 2
  const normalizedPath = hasLocale
    ? `/${segments.slice(1).join("/")}`
    : pathname

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items && item.items.length > 0)

          const hasActiveChild = item.items?.some(
            (sub) => normalizedPath === sub.url
          )

          const isSingleActive =
            !hasChildren &&
            (item.url === "/dashboard"
              ? normalizedPath === "/dashboard"
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
