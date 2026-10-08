"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink, XIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/config/app_config"
import { appRoutes } from "@/lib/config/app-routes"
import { AppLogo } from "../ui/app-logo"

export function StoreSwitcher() {
  const { isMobile, state, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex w-full items-center gap-1.5 transition-colors group-data-[collapsible=icon]:justify-center">
          <SidebarMenuButton
            size="lg"
            className="flex-1 p-0 transition-opacity group-data-[collapsible=icon]:size-8.5! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! hover:opacity-85"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 group-data-[collapsible=icon]:size-8">
              <AppLogo className="size-4 shrink-0 text-foreground" />
            </div>

            {!isCollapsed && (
              <div className="flex min-w-0 flex-1 flex-col text-start">
                <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {APP_NAME}
                </span>
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  Store Console
                </span>
              </div>
            )}
          </SidebarMenuButton>

          {isMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpenMobile(false)}
              className="cursor-pointer hover:bg-muted"
              aria-label="Close sidebar"
            >
              <XIcon className="size-4.5" />
            </Button>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
