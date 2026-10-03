import Link from "next/link"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get-selected-currency"
import { AppLogo } from "@/components/ui/app-logo"

import DesktopNav from "./desktop-nav"
import { MobileNav } from "./mobile-nav"

export default async function Navbar({ user }: { user: CurrentUser | null }) {
  const currentCurrency = await getSelectedCurrency()

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
            <DesktopNav user={user} currentCurrency={currentCurrency} />
            <MobileNav user={user} currentCurrency={currentCurrency} />
          </div>
        </div>
      </div>
    </nav>
  )
}
