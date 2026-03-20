"use client"

import * as React from "react"
import { AppLogo } from "@/components/shared/app-logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import MenuButton from "@/components/shared/menu_button"
import {
  MobileMenu,
  MobileMenuHeader,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuItem,
} from "@/components/ui/mobile-menu"
import { useAuth } from "@/hooks/useAuth"
import { siteConfig } from "@/lib/config/site_config"
import Link from "next/link"
import { appRouter } from "@/lib/app-routes"
import { useLocale, useTranslations } from "next-intl"
import {} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { redirect, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  MonitorIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  SearchIcon,
  HomeIcon,
  PackageIcon,
  GlobeIcon,
  CheckIcon,
  LifeBuoyIcon,
  BookIcon,
} from "@/components/shared/icons"

export default function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const t = useTranslations("Header")
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { profile, user, signOut } = useAuth()
  const avatar = profile?.avatar_url
  const menuItems = user ? siteConfig.userMenuItems : []

  const handleLogout = async () => {
    await signOut()
  }

  function onSelectChange(nextLocale: string) {
    redirect(`/${nextLocale}${pathname}`)
  }

  function handleThemeChange(theme: string) {
    setTheme(theme)
  }

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-12 items-center gap-4 px-4">
          {/* Logo - Left */}
          <div className="flex grow-3 items-center justify-start">
            <AppLogo />
          </div>

          {/* Search - Center (macOS Spotlight style) */}
          <div className="flex grow-7 items-center justify-center">
            <Button
              variant="secondary"
              className="h-8 w-full max-w-md gap-2 rounded-full bg-background px-3 text-sm text-muted-foreground shadow-none hover:bg-background/80"
            >
              <SearchIcon className="size-4" />
              <span>{t("search")}</span>
            </Button>
          </div>

          {/* User Avatar / Menu - Right */}
          <nav className="flex grow-3 items-center justify-end gap-2">
            <div className="hidden items-center lg:flex">
              {user ? (
                <Avatar className="size-8">
                  <AvatarImage
                    src={avatar || undefined}
                    alt={profile?.full_name || ""}
                  />
                  <AvatarFallback className="p-1.5">
                    <UserIcon className="size-max text-foreground" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full px-4 shadow-none"
                  asChild
                >
                  <Link href={appRouter.signIn}>
                    <span>{t("getStarted")}</span>
                  </Link>
                </Button>
              )}
            </div>
            {/* Mobile Menu Button */}
            <MenuButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="block lg:hidden"
            />
          </nav>
        </div>
      </header>

      {/* Monile Mwnu */}
      <MobileMenu isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <MobileMenuHeader className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage
              src={avatar || undefined}
              alt={profile?.full_name || ""}
            />
            <AvatarFallback className="p-1.5">
              <UserIcon className="size-max text-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="text-base leading-none font-semibold">
              {profile?.full_name || "Guest"}
            </span>
            <span className="text-sm text-muted-foreground">
              {profile?.email || ""}
            </span>
          </div>
        </MobileMenuHeader>

        <MobileMenuBody>
          <MobileMenuItem key="home" href={appRouter.home} icon={HomeIcon}>
            {t("menuItems.home")}
          </MobileMenuItem>

          <MobileMenuItem
            key="products"
            href={appRouter.home}
            icon={PackageIcon}
          >
            {t("menuItems.products")}
          </MobileMenuItem>

          {menuItems.map((item) => (
            <MobileMenuItem
              key={`/${item.key}`}
              href={item.href}
              icon={item.icon}
            >
              {t("menuItems." + item.key)}
            </MobileMenuItem>
          ))}

          {/* language */}

          <Accordion type="single" collapsible defaultValue="item-2">
            <AccordionItem value="item-1">
              <AccordionTrigger className="p-0">
                <MobileMenuItem key="language" className="w-auto">
                  <GlobeIcon className="mr-2 h-4 w-4" />
                  {t("menuItems.language")}
                </MobileMenuItem>
              </AccordionTrigger>
              <AccordionContent>
                <MobileMenuItem
                  key="arabic"
                  className={locale === "ar" ? "" : "ml-9 rtl:mr-9 rtl:ml-0"}
                  onClick={() => onSelectChange("ar")}
                >
                  {locale === "ar" && (
                    <CheckIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                  )}
                  {t("menuItems.arabic")}
                </MobileMenuItem>
                <MobileMenuItem
                  key="english"
                  className={locale === "en" ? "" : "ml-9 rtl:mr-9 rtl:ml-0"}
                  onClick={() => onSelectChange("en")}
                >
                  {locale === "en" && (
                    <CheckIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                  )}
                  {t("menuItems.english")}
                </MobileMenuItem>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" collapsible defaultValue="item-3">
            <AccordionItem value="item-1">
              <AccordionTrigger className="p-0" suppressHydrationWarning>
                <MobileMenuItem key="theme" className="w-auto">
                  {theme === "light" && <SunIcon className="mr-2 h-4 w-4" />}
                  {theme === "dark" && <MoonIcon className="mr-2 h-4 w-4" />}
                  {theme === "system" && (
                    <MonitorIcon className="mr-2 h-4 w-4" />
                  )}

                  {t("menuItems.theme")}
                </MobileMenuItem>
              </AccordionTrigger>
              <AccordionContent>
                <MobileMenuItem
                  key="system"
                  className={theme === "system" ? "" : "ml-9 rtl:mr-9 rtl:ml-0"}
                  onClick={() => handleThemeChange("system")}
                >
                  {theme === "system" && (
                    <CheckIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                  )}
                  {t("menuItems.system")}
                </MobileMenuItem>

                <MobileMenuItem
                  key="dark"
                  className={theme === "dark" ? "" : "ml-9 rtl:mr-9 rtl:ml-0"}
                  onClick={() => handleThemeChange("dark")}
                >
                  {theme === "dark" && (
                    <CheckIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                  )}
                  {t("menuItems.dark")}
                </MobileMenuItem>

                <MobileMenuItem
                  key="light"
                  className={theme === "light" ? "" : "ml-9 rtl:mr-9 rtl:ml-0"}
                  onClick={() => handleThemeChange("light")}
                >
                  {theme === "light" && (
                    <CheckIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                  )}
                  {t("menuItems.light")}
                </MobileMenuItem>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <MobileMenuItem
            key="support"
            href={appRouter.home}
            icon={LifeBuoyIcon}
          >
            {t("menuItems.support")}
          </MobileMenuItem>

          <MobileMenuItem
            key="documentation"
            href={appRouter.home}
            icon={BookIcon}
          >
            {t("menuItems.documentation")}
          </MobileMenuItem>
        </MobileMenuBody>

        <MobileMenuFooter>
          {user ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              {t("signOut")}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" asChild>
                <Link href={appRouter.signIn}>{t("signIn")}</Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href={appRouter.signUp}>{t("createAccount")}</Link>
              </Button>
            </div>
          )}
        </MobileMenuFooter>
      </MobileMenu>
    </>
  )
}
