"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
        <div className="flex w-full items-center gap-2 rounded-xl p-1.5 transition-colors">
          {/* رابط لوحة التحكم الرئيسية مع شعار الموقع وإزالة الشادو */}
          <Link
            href={appRoutes.dashboard.home}
            onClick={handleLinkClick}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition-opacity hover:opacity-85 focus-visible:outline-hidden"
          >
            <div className="relative flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <AppLogo size="sm" className="size-5 text-primary-foreground" />
              <span className="absolute -inset-e-0.5 -top-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
            </div>

            {!isCollapsed && (
              <div className="flex min-w-0 flex-col text-start">
                <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {APP_NAME}
                </span>
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  Store Console
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
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
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
