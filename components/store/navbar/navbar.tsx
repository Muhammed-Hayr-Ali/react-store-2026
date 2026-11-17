/**
 * @file components/store/navbar/navbar.tsx
 * @description Simplified responsive store navigation bar for desktop and mobile.
 */

"use client"

import Link from "next/link"
import { AppLogo } from "@/components/ui/app-logo"
import { Button } from "@/components/ui/button"
import DesktopNavbar from "./desktop-navbar"
import { CartIcon } from "../bottom-navigation-bar/bottom-navbar-icons"
import { useCart } from "@/lib/context/cart-context"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCartIcon } from "lucide-react"

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
  const { totalItemsCount, isPending } = useCart()

  return (
    <nav className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between bg-background/80 px-4 backdrop-blur-md transition-colors md:hidden">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center">
        <AppLogo className="size-6" />
      </Link>

      {/* Action Button */}
      <Button
        variant="outline"
        size="icon"
        className="relative rounded-full"

        aria-label="Notifications"
      >
        <ShoppingCartIcon />
        {isPending && <Spinner className="absolute size-9 stroke-[0.5px]" />}

        {totalItemsCount > 0 && (
          <div
            aria-hidden
            className={cn(
              "absolute -top-1 -right-1 flex h-3.5 items-center justify-center rounded-full bg-foreground text-[9px] font-normal text-background transition-all duration-500 ease-in-out",
              isPending || totalItemsCount < 99 ? "w-3.5" : "w-5.5"
            )}
          >
            {totalItemsCount > 99 ? "99+" : totalItemsCount}
          </div>
        )}
      </Button>
    </nav>
  )
}
