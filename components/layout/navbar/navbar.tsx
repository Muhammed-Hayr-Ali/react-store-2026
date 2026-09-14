import Link from "next/link"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { MainNavbarMenu } from "./main-menu"
import { MobileNav } from "./mobile-nav"
import DesktopNav from "./desktop-nav"
import { AppLogo } from "@/components/ui/app-logo"

export default function Navbar({ user }: { user: CurrentUser | null }) {
  return (
    <nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-262.5 px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between">
          {/* الجزء الأيسر: الشعار */}
          <div className="flex flex-1 items-center justify-start md:items-stretch">
            <Link href="/" className="flex items-center">
              <AppLogo className="size-6" />
            </Link>
          </div>
          {/* الجزء الأوسط: روابط الديسكتوب */}
          <MainNavbarMenu />
          {/* الجزء الأيمن: أيقونة سلة التسوق */}
          <div className="flex flex-1 items-center justify-end gap-6 md:gap-8">
            {/* Desktop Navigation */}
            <DesktopNav user={user} />
            {/* Mobile Navigation */}
            <MobileNav user={user} />
          </div>
        </div>
      </div>
    </nav>
  )
}
