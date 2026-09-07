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

interface DesktopNavProps {
  className?: string
  user: CurrentUser | null
}

export default function DesktopNav({ user, className }: DesktopNavProps) {
  return (
    <div className={cn("hidden md:block", className)}>
      {user ? (
        <div className="flex items-center gap-8">
          {/* Search */}
          <SearchIcon className="size-4" />
          {/* Shopping Cart */}
          <ShoppingCartIcon className="size-4" />
          {/* User Menu */}
          <UserMenu user={user} />
        </div>
      ) : (
        <CustomButton size="sm" className="text-[10px] font-normal" asChild>
          <Link href={appRoutes.auth.signup}>Get Started</Link>
        </CustomButton>
      )}
    </div>
  )
}

function UserMenu({ user }: { user: CurrentUser }) {
  const router = useRouter()

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      router.refresh() // Refresh the page to update the UI after logout
    }
  }

  return (
    <CustomPopover>
      <CustomPopoverTrigger>
        <Avatar>
          <AvatarImage src={user.profile_image} />
          <AvatarFallback className="p-2">
            <UserIcon />
          </AvatarFallback>
        </Avatar>
      </CustomPopoverTrigger>
      <CustomPopoverContent align="end" className="gap-0 rounded-sm">
        <CustomPopoverHeader>
          <UserProfile user={user} />
        </CustomPopoverHeader>
        <Separator />
        {appConfig.menu.userMenu.items.map((item) => (
          <CustomButton
            key={item.href}
            size="lg"
            variant="ghost"
            className="flex items-center justify-start text-xs font-normal"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="size-3" />
              {item.label}
            </Link>
          </CustomButton>
        ))}
        <Separator />
        {appConfig.menu.supportLinks.items.map((item) => (
          <CustomButton
            key={item.href}
            size="lg"
            variant="ghost"
            className="flex items-center justify-start text-xs font-normal"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="size-3" />
              {item.label}
            </Link>
          </CustomButton>
        ))}
        <Separator />
        <CustomButton
          size="lg"
          variant="ghost"
          className="flex items-center justify-start text-xs font-normal text-destructive hover:text-destructive/90"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-3" />
          Logout
        </CustomButton>
      </CustomPopoverContent>
    </CustomPopover>
  )
}
