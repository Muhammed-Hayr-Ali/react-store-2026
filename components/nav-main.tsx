"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"
import { roleNavIcons } from "@/lib/data/sidebar-icons"

type Role = "admin" | "vendor" | "customer" | "delivery"
type IconKey = keyof (typeof roleNavIcons)[Role]

export function NavMain({
  items,
  role,
}: {
  items: {
    title: string
    url: string
    icon?: string | React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  role?: Role
}) {
  const getIcon = (
    iconKey: string | React.ReactNode | undefined,
    role: Role | undefined
  ) => {
    if (!iconKey || !role) return null

    // إذا كان الأيقونة React.Node بالفعل
    if (typeof iconKey !== "string") return iconKey

    // إذا كان الأيقونة string، نبحث في roleNavIcons
    const icons = roleNavIcons[role]
    if (icons && iconKey in icons) {
      return icons[iconKey as IconKey]
    }

    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Platform"}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          // إذا كان العنصر لا يحتوي على عناصر فرعية (مثل Dashboard)
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title} className="">
                <SidebarMenuButton asChild tooltip={item.title} size="lg">
                  <a href={item.url}>
                    {getIcon(item.icon, role)}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // إذا كان العنصر يحتوي على عناصر فرعية
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem className="">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} size="lg">
                    {getIcon(item.icon, role)}
                    <span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
