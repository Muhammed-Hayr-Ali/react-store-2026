"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CurrentUser } from "@/lib/actions/utils/profile"
import { appRoutes } from "@/lib/config/app-routes"
import {
  LogOutIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { CustomButton } from "@/components/ui/custom-button"
import { cn } from "@/lib/utils"
import { appConfig } from "@/lib/config/app_config"
import { signOut } from "@/lib/actions/authentication/signOut"
import UserProfile from "./user-profile"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import {
  CustomPopover,
  CustomPopoverContent,
  CustomPopoverHeader,
  CustomPopoverTrigger,
} from "@/components/ui/custom-popover"

// ✅ استيراد مكون تبديل العملة ونوع البيانات
import { CurrencySwitcher } from "@/components/store/currency/CurrencySwitcher"
import type { CurrencyCode } from "@/lib/actions/currency/types"

interface DesktopNavProps {
  className?: string
  user: CurrentUser | null
  currentCurrency: CurrencyCode // ✅ إضافة جديدة لاستقبال العملة الحالية
}

export default function DesktopNav({
  user,
  className,
  currentCurrency,
}: DesktopNavProps) {
  return (
    <div className={cn("hidden items-center gap-4 md:flex", className)}>
      {/* Search */}
      <CustomButton
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
      >
        <SearchIcon className="size-4" />
      </CustomButton>

      {/* Shopping Cart */}
      <CustomButton
        variant="ghost"
        size="icon-sm"
        className="relative text-muted-foreground hover:text-foreground"
      >
        <ShoppingCartIcon className="size-4" />
        {/* يمكن إضافة شارة (Badge) لعدد العناصر هنا لاحقاً */}
      </CustomButton>

      {/* ✅ Currency Switcher */}
      <CurrencySwitcher currentCurrency={currentCurrency} />

      {/* User Menu or Auth Buttons */}
      {user ? (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <UserMenu user={user} />
        </>
      ) : (
        <div className="ml-1 flex items-center gap-2 border-l border-border/50 pl-4">
          <CustomButton
            size="sm"
            variant="outline"
            className="h-8 text-xs font-normal"
            asChild
          >
            <Link href={appRoutes.auth.login}>Login</Link>
          </CustomButton>
          <CustomButton size="sm" className="h-8 text-xs font-normal" asChild>
            <Link href={appRoutes.auth.signup}>Get Started</Link>
          </CustomButton>
        </div>
      )}
    </div>
  )
}

function UserMenu({ user }: { user: CurrentUser }) {
  const router = useRouter()

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      router.refresh() // تحديث الصفحة بعد تسجيل الخروج
    }
  }

  return (
    <CustomPopover>
      <CustomPopoverTrigger>
        <Avatar className="size-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/20">
          <AvatarImage src={user.profile_image || undefined} />
          <AvatarFallback className="p-1.5">
            <UserIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
      </CustomPopoverTrigger>
      <CustomPopoverContent align="end" className="w-56 gap-0 rounded-md p-0">
        <CustomPopoverHeader className="px-4 py-3">
          <UserProfile user={user} />
        </CustomPopoverHeader>

        <Separator />
        <div className="p-1">
          {appConfig.menu.userMenu.items.map((item) => (
            <CustomButton
              key={item.href}
              size="sm"
              variant="ghost"
              className="h-8 w-full justify-start text-xs font-normal"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 size-3.5" />
                {item.label}
              </Link>
            </CustomButton>
          ))}
        </div>

        <Separator />
        <div className="p-1">
          {appConfig.menu.supportLinks.items.map((item) => (
            <CustomButton
              key={item.href}
              size="sm"
              variant="ghost"
              className="h-8 w-full justify-start text-xs font-normal"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 size-3.5" />
                {item.label}
              </Link>
            </CustomButton>
          ))}
        </div>

        <Separator />
        <div className="p-1">
          <CustomButton
            size="sm"
            variant="ghost"
            className="h-8 w-full justify-start text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 size-3.5" />
            Logout
          </CustomButton>
        </div>
      </CustomPopoverContent>
    </CustomPopover>
  )
}
