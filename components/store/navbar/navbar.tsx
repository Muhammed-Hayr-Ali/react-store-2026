/**
 * @file components/store/navbar/navbar.tsx
 * @description Simplified responsive store navigation bar for desktop and mobile.
 */

"use client"

import Link from "next/link"
import { AppLogo } from "@/components/ui/app-logo"
import { Button } from "@/components/ui/button"
import DesktopNavbar from "./desktop-navbar"
import { useCart } from "@/lib/context/cart-context"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { ShoppingCartIcon } from "lucide-react"
import { NotificationIcon } from "@/components/shared/icons"
import { useUser } from "@/lib/context/user-context"

export default function Navbar() {
  return (
    <>
      <DesktopBar />
      <MobileBar />
    </>
  )
}

function DesktopBar() {
  return (
    <nav className="sticky top-0 z-50 hidden w-full shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors md:block">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <AppLogo className="size-6" />
        </Link>
        <DesktopNavbar />
      </div>
    </nav>
  )
}

function MobileBar() {
  const { user, rawUser } = useUser()

  return (
    <nav className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between bg-background/80 px-4 backdrop-blur-md transition-colors md:hidden">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center">
        <AppLogo className="size-6" />
      </Link>

      {/* Action Button */}
      <Button
        variant="secondary"
        size="icon"
        className="relative rounded-full"

        aria-label="Notifications"
      >
        <div className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-red-600" />
        <NotificationIcon className="size-4 text-foreground" />
      </Button>
    </nav>
  )
}
