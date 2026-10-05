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
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

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

          // فحص العنصر الفرعي: تطابق تام فقط لمنع تداخل create مع allProducts
          const hasActiveChild = item.items?.some(
            (sub) => normalizedPath === sub.url
          )

          // للعنصر الرئيسي: إذا لم يكن له أبناء نتحقق من تطابقه أو تفرعاته
          const isSingleActive =
            !hasChildren &&
            (item.url === "/dashboard"
              ? normalizedPath === "/dashboard"
              : normalizedPath === item.url ||
                normalizedPath.startsWith(`${item.url}/`))

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
                    {/* الزر الأب يكتسب فقط حالة الفتح أو إشارة هادئة دون سحب لون التفعيل الكامل عن العنصر الفرعي */}
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={false} // تركه false لمنع تلوين الزر الرئيسي بالتزامن مع الفرعي
                      className="font-medium data-[state=open]:text-foreground"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        // تطابق دقيق ومطلق فقط
                        const isSubActive = normalizedPath === subItem.url

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubActive}
                            >
                              <Link href={subItem.url}>
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
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
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
