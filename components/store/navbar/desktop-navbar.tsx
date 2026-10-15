"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, ShoppingCartIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { appRoutes } from "@/lib/config/app-routes"
import { useUser } from "@/lib/context/user-context"
import { cn } from "@/lib/utils"

import UserProfilePopover from "./user-profile-popover"

interface DesktopNavbarProps {
  className?: string
}

export default function DesktopNavbar({ className }: DesktopNavbarProps) {
  const { user } = useUser()

  return (
    <div className={cn("hidden items-center gap-3 md:flex", className)}>
      <Button variant="secondary" size="icon" aria-label="Search">
        <SearchIcon />
      </Button>

      <Button variant="secondary" size="icon" aria-label="Shopping Cart">
        <ShoppingCartIcon />
      </Button>

      {user ? (
        <>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <UserProfilePopover />
        </>
      ) : (
        <div className="ms-1 flex items-center gap-2 border-s border-border/50 ps-3">
          <Button
            size="default"
            variant="secondary"
            className="rounded-xl text-xs font-normal"
            aria-label="Login"
            asChild
          >
            <Link href={appRoutes.auth.login}>Login</Link>
          </Button>
          <Button
            size="default"
            variant="default"
            className="rounded-xl text-xs font-normal"
            aria-label="Get Started"
            asChild
          >
            <Link href={appRoutes.auth.signup}>Get Started</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
