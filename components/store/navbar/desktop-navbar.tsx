"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, ShoppingCartIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CurrencySwitcher } from "@/components/store/currency/CurrencySwitcher"

import { appRoutes } from "@/lib/config/app-routes"
import { useUser } from "@/lib/context/user-context"
import type { NotificationRecord } from "@/lib/actions/notifications/types"
import { cn } from "@/lib/utils"

import UserProfilePopover from "./user-profile-popover"
import { NotificationPopover } from "@/components/notifications/notification-popover.tsx"

interface DesktopNavbarProps {
  className?: string
  initialNotifications: NotificationRecord[]
  initialUnreadCount: number
}

export default function DesktopNavbar({
  className,
  initialNotifications,
  initialUnreadCount,
}: DesktopNavbarProps) {
  const { user } = useUser()

  return (
    <div className={cn("hidden items-center gap-3 md:flex", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
        aria-label="Search"
      >
        <SearchIcon className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground"
        aria-label="Shopping Cart"
      >
        <ShoppingCartIcon className="size-4" />
      </Button>

      {user && (
        <NotificationPopover
          initialNotifications={initialNotifications}
          initialUnreadCount={initialUnreadCount}
          currentUserId={user.id}
        />
      )}

      <CurrencySwitcher />

      {user ? (
        <>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <UserProfilePopover
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
          />
        </>
      ) : (
        <div className="ms-1 flex items-center gap-2 border-s border-border/50 ps-3">
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs font-normal"
            asChild
          >
            <Link href={appRoutes.auth.login}>Login</Link>
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-lg text-xs font-normal"
            asChild
          >
            <Link href={appRoutes.auth.signup}>Get Started</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
