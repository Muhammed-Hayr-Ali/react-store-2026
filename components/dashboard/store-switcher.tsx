"use client"

import { ChevronsUpDown, LinkIcon } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AppLogo } from "../ui/app-logo"
import { appConfig } from "@/lib/config/app_config"

export function StoreSwitcher() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:shadow-noney hover:bg-transparent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <AppLogo className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{appConfig.name}</span>
            <span className="truncate text-xs">Store Console</span>
          </div>
          <LinkIcon className="ml-auto" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
