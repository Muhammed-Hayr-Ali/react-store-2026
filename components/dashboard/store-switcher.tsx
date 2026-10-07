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

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex w-full items-center gap-1.5 transition-colors group-data-[collapsible=icon]:justify-center">
          <SidebarMenuButton
            size="lg"
            asChild
            className="flex-1 transition-opacity group-data-[collapsible=icon]:!size-8.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 hover:opacity-85"
          >
            <Link
              href={appRoutes.dashboard.home}
              onClick={handleLinkClick}
              className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-white shadow-xs group-data-[collapsible=icon]:size-8">
                <AppLogo size="sm" className="size-4.5 text-foreground" />
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
            </Link>
          </SidebarMenuButton>

          {/* زر عرض المتجر في الشاشات العادية */}
          {!isCollapsed && !isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={appRoutes.home}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-border/40 text-muted-foreground transition-all hover:border-border hover:bg-muted/70 hover:text-foreground"
                  aria-label="View Live Store"
                >
                  <ExternalLink className="size-3.5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">View Live Store</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* زر إغلاق واضح وصريح عند فتح القائمة على الجوال */}
          {isMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpenMobile(false)}
              className="size-8 shrink-0 cursor-pointer rounded-lg border border-border/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close sidebar"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
