/**
 * @file components/store/navbar/navbar.tsx
 * @description Simplified responsive store navigation bar for desktop and mobile.
 */

"use client"

import Link from "next/link"
import { AppLogo } from "@/components/shared/app-logo"
import { Button } from "@/components/ui/button"
import DesktopNavbar from "./desktop-navbar"
import { CartIcon } from "@/components/shared/icons"
import { useCart } from "@/lib/context/cart-context"
import { cn } from "@/lib/utils"

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
  const { totalItemsCount } = useCart()

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
        <div
          className={cn(
            "absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full border-2 border-background bg-red-600 text-[9px] text-white",
            totalItemsCount > 99 ? "h-4.5 w-5.5" : "size-4"
          )}
        >
          <span className="translate-y-[0.5px]">{totalItemsCount}</span>
        </div>
        <CartIcon className="size-4 text-foreground" />
      </Button>
    </nav>
  )
}
