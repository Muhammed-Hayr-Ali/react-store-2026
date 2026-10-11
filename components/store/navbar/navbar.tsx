import Link from "next/link"
import { AppLogo } from "@/components/ui/app-logo"

import DesktopNavbar from "./desktop-navbar"
import { MobileMenu } from "./mobile-menu"

export default async function Navbar() {



  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/60 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center">
              <AppLogo className="size-6" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
            <DesktopNavbar
            />
            <MobileMenu
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
