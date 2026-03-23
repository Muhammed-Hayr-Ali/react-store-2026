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
import Link from "next/link"
import { useTranslations } from "next-intl"

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
  const t = useTranslations("SidebarNav")

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

  const getTranslationKey = (key: string, role: Role | undefined) => {
    if (!role) return key
    return `${role}.${key}`
  }

  const getRoleLabel = (role: Role | undefined) => {
    if (!role) return ""
    return t(`roles.${role}`)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
        {getRoleLabel(role)}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          // إذا كان العنصر لا يحتوي على عناصر فرعية (مثل Dashboard)
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title} className="mb-1">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  size="md"
                  className="group-data-[collapsible=icon]:justify-center"
                >
                  <Link href={item.url}>
                    {getIcon(item.icon, role)}
                    <span className="group-data-[collapsible=icon]:hidden">
                      {t(getTranslationKey(item.title, role))}
                    </span>
                  </Link>
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
              <SidebarMenuItem className="mb-1">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    size="md"
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    {getIcon(item.icon, role)}
                    <span className="group-data-[collapsible=icon]:hidden">
                      {t(getTranslationKey(item.title, role))}
                    </span>
                    <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>
                              {t(getTranslationKey(subItem.title, role))}
                            </span>
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
