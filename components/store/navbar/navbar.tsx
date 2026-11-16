/**
 * @file components/store/navbar/navbar.tsx
 * @description Simplified responsive store navigation bar for desktop and mobile.
 */

import Link from "next/link"
import { AppLogo } from "@/components/ui/app-logo"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import DesktopNavbar from "./desktop-navbar"

export default async function Navbar() {
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
  return (
    <nav className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-md transition-colors md:hidden">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center">
        <AppLogo className="size-6" />
      </Link>

      {/* Action Button */}
      <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
        <Bell className="size-5" />
      </Button>
    </nav>
  )
}