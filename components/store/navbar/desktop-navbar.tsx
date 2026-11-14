/**
 * @file components/store/navbar/desktop-navbar.tsx
 * @description Desktop navigation bar including search, shopping cart sheet, currency switcher, and user profile/auth actions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import { APP_ROUTES } from "@/lib/config/app-routes"
import { useUser } from "@/lib/context/user-context"
import { cn } from "@/lib/utils"

import UserProfilePopover from "./user-profile-popover"
import { CurrencySwitcher } from "@/components/shared/currency-switcher"
import { CartSheet } from "@/components/cart/cart-sheet"

interface DesktopNavbarProps {
  className?: string
}

export default function DesktopNavbar({ className }: DesktopNavbarProps) {
  const { user } = useUser()

  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      {/* قائمة تبديل العملة */}
      <CurrencySwitcher />

      <Button variant="secondary" size="icon" aria-label="Search">
        <SearchIcon />
      </Button>

      {/* سلة المشتريات الجانبية */}
      <CartSheet />

      {user ? (
        <>
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
            <Link href={APP_ROUTES.AUTH.LOGIN}>Login</Link>
          </Button>
          <Button
            size="default"
            variant="default"
            className="rounded-xl text-xs font-normal"
            aria-label="Get Started"
            asChild
          >
            <Link href={APP_ROUTES.AUTH.GET_STARTED}>Get Started</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
