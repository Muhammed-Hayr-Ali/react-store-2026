import Link from "next/link"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { MainNavbarMenu } from "./main-menu"
import { MobileNav } from "./mobile-nav"
import DesktopNav from "./desktop-nav"
import { AppLogo } from "@/components/ui/app-logo"

// ✅ 1. استيراد دالة جلب العملة المختارة
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get_selected_currency"

export default async function Navbar({ user }: { user: CurrentUser | null }) {
  // ✅ 2. جلب العملة الحالية من الكوكيز (تتم في الخادم بسرعة وأمان)
  const currentCurrency = await getSelectedCurrency()

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/60 backdrop-blur-md transition-colors">
      {/* توحيد الحاوية لتطابق صفحات المحتوى بدقة */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex flex-1 items-center justify-start">
            <Link href="/" className="flex items-center">
              <AppLogo className="size-6" />
            </Link>
          </div>

          {/* Center Links */}
          <MainNavbarMenu />

          {/* Right Actions */}
          <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
            {/* ✅ 3. تمرير العملة إلى مكون الديسكتوب */}
            <DesktopNav user={user} currentCurrency={currentCurrency} />

            {/* ✅ 4. تمرير العملة إلى مكون الجوال أيضاً */}
            <MobileNav user={user}  />
          </div>
        </div>
      </div>
    </nav>
  )
}
