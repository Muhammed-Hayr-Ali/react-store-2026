"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BellIcon, LogOutIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CustomPopover,
  CustomPopoverContent,
  CustomPopoverHeader,
  CustomPopoverTrigger,
} from "@/components/ui/custom-popover"

import { CurrentUser } from "@/lib/actions/utils/profile"
import { signOut } from "@/lib/actions/authentication/signOut"
import { appRoutes } from "@/lib/config/app-routes"
import { storeNavConfig } from "./nav-config"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  user: CurrentUser
  className?: string
}

export function UserProfileHeader({
  user,
  className,
}: {
  user: CurrentUser
  className?: string
}) {
  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email?.split("@")[0] ||
    "User"

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={user.profile_image || undefined}
            alt={displayName}
          />
          <AvatarFallback className="p-1.5">
            <UserIcon className="size-full text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col items-start justify-center">
          <p
            className="w-full truncate text-xs font-semibold text-foreground"
            title={displayName}
          >
            {displayName}
          </p>
          {user.email && (
            <p
              className="w-full truncate text-[11px] text-muted-foreground"
              title={user.email}
            >
              {user.email}
            </p>
          )}
          {user.role === "admin" && (
            <span className="mt-0.5 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
              Admin
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 ps-1">
        <div className="relative">
          <span className="absolute -inset-e-0.5 -top-0.5 z-10 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <BellIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function UserMenu({ user, className }: UserMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const result = await signOut()
      if (result.success) {
        router.replace(appRoutes.home)
        router.refresh()
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <CustomPopover>
      <CustomPopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
            className
          )}
          aria-label="User profile menu"
        >
          <Avatar className="size-8 ring-2 ring-transparent transition-all hover:ring-primary/20">
            <AvatarImage src={user.profile_image || undefined} />
            <AvatarFallback className="p-1.5">
              <UserIcon className="size-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </button>
      </CustomPopoverTrigger>

      <CustomPopoverContent
        align="end"
        className="w-max max-w-[300px] min-w-[260px] gap-0 rounded-xl p-0 shadow-lg"
      >
        <CustomPopoverHeader className="px-3.5 py-3">
          <UserProfileHeader user={user} />
        </CustomPopoverHeader>

        <Separator />
        <div className="p-1.5">
          {storeNavConfig.userMenu.items.map((item) => (
            <Button
              key={item.href}
              size="sm"
              variant="ghost"
              className="h-8 w-full justify-start rounded-lg text-xs font-normal"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="me-2 size-3.5 text-muted-foreground" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        <Separator />
        <div className="p-1.5">
          {storeNavConfig.supportLinks.items.map((item) => (
            <Button
              key={item.href}
              size="sm"
              variant="ghost"
              className="h-8 w-full justify-start rounded-lg text-xs font-normal"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="me-2 size-3.5 text-muted-foreground" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        <Separator />
        <div className="p-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-full justify-start rounded-lg text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOutIcon className="me-2 size-3.5" />
            Logout
          </Button>
        </div>
      </CustomPopoverContent>
    </CustomPopover>
  )
}
