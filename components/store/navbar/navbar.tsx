import Link from "next/link"
import { AppLogo } from "@/components/ui/app-logo"

import DesktopNavbar from "./desktop-navbar"
import { MobileMenu } from "./mobile-menu"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

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
    <nav className="sticky top-0 z-50 hidden w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors md:block">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center">
              <AppLogo className="size-6" />
            </Link>
          </div>
          <DesktopNavbar />
        </div>
      </div>
    </nav>
  )
}

function MobileBar() {
  return (
    <nav className="sticky top-0 z-50 block w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors md:hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center text-3xl font-medium">
              <AppLogo className="size-6" />
            </Link>
          </div>

          <Button variant="secondary" size="icon-lg">
            <Bell />
          </Button>
        </div>
      </div>
    </nav>
  )
}

function OldMobileBar() {
  return (
    <nav className="sticky top-0 z-50 block w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors md:hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center">
              <AppLogo className="size-6" />
            </Link>
          </div>
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}
