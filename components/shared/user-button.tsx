"use client"
import {
  FileTextIcon,
  HelpCircleIcon,
  LanguagesIcon,
  LayoutDashboard,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  Package,
  PaletteIcon,
  SunIcon,
  Ticket,
} from "@/components/shared/new-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/config/site_config"
import { useAuth } from "@/hooks/useAuth"
import { UserIcon } from "@/components/shared/new-icons"

export default function UserButtonClient() {
  const { user } = useAuth()
  if (!user) {
    return (
      <Button variant={"ghost"} size={"icon-sm"} asChild>
        <Link href="/auth/login">
          <UserIcon />
        </Link>
      </Button>
    )
  }
  return (
    <Button variant={"ghost"} size={"icon-sm"} asChild>
      <UserButton />
    </Button>
  )
}

export const UserButton = () => {
  const { profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChangeLocale = (selectedLocale: string) => {
    if (selectedLocale && selectedLocale !== locale) {
      const newPath = pathname.replace(``, "")
      const params = new URLSearchParams(searchParams.toString())
      router.push(`/${selectedLocale}${newPath}?${params.toString()}`)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <span className="sr-only">User options</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mx-4 w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm text-foreground">
                {profile?.full_name}
              </span>
              <span>{profile?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs" asChild>
            <Link href={`/dashboard/orders`}>
              <Package />
              Oreders
              <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <Ticket />
            My Coupons
            <DropdownMenuShortcut>⇧⌘M</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">View</DropdownMenuLabel>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
              <PaletteIcon />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">
                    Appearance
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <DropdownMenuRadioItem value="light" className="text-xs">
                      <SunIcon />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" className="text-xs">
                      <MoonIcon />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system" className="text-xs">
                      <MonitorIcon />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
              <LanguagesIcon />
              Language
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">
                    default language
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={
                      siteConfig.lsnguages.find((loc) => loc.value === locale)
                        ?.value || siteConfig.defaultLocale
                    }
                    onValueChange={handleChangeLocale}
                  >
                    {siteConfig.lsnguages.map((loc) => (
                      <DropdownMenuRadioItem key={loc.name} value={loc.value}>
                        {loc.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">Account</DropdownMenuLabel>
          <Link href={`/dashboard`}>
            <DropdownMenuItem className="text-xs">
              <LayoutDashboard />
              Dashboard
              <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-xs">
            <HelpCircleIcon />
            Help & Support
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <FileTextIcon />
            Documentation
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="text-xs"
            onClick={handleLogout}
          >
            <LogOutIcon />
            Sign Out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
