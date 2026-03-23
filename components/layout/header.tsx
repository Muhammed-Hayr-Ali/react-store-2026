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
import { siteConfig } from "@/lib/config/site_config"
import Link from "next/link"
import { appRouter } from "@/lib/app-routes"
import { useLocale, useTranslations } from "next-intl"
import { EllipsisVerticalIcon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { redirect, usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  UserIcon,
  SearchIcon,
  HomeIcon,
  PackageIcon,
  GlobeIcon,
  CheckIcon,
  LifeBuoyIcon,
  BookIcon,
  ThemeModeIcon,
} from "@/components/shared/icons"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/lib/providers/auth-provider"
import { ButtonGroup } from "../ui/button-group"

// ============================================================================
// 🎣 Custom Hook: shared logic for Header components
// ============================================================================
function useHeaderLogic() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const t = useTranslations("Header")
  const { profile, user, signOut, isLoading } = useAuth()

  // ✅ Memoize avatar to prevent unnecessary re-renders
  const avatar = React.useMemo(() => profile?.avatar_url, [profile?.avatar_url])

  // ✅ Memoize menu items to avoid recalculation on every render
  const menuItems = React.useMemo(
    () => (user ? siteConfig.userMenuItems : []),
    [user]
  )

  // ✅ Memoize handlers with useCallback to maintain referential equality
  const handleLogout = React.useCallback(async () => {
    await signOut()
    router.refresh()
  }, [signOut, router])

  const handleLocaleChange = React.useCallback(
    (nextLocale: string) => {
      redirect(`/${nextLocale}${pathname}`)
    },
    [pathname]
  )

  const handleThemeChange = React.useCallback(
    (newTheme: string) => {
      setTheme(newTheme)
    },
    [setTheme]
  )

  return {
    router,
    pathname,
    theme,
    locale,
    t,
    profile,
    user,
    isLoading,
    avatar,
    menuItems,
    handleLogout,
    handleLocaleChange,
    handleThemeChange,
  }
}

// ============================================================================
// 🧩 Reusable: Menu Items Renderer (DRY Principle)
// ============================================================================
function renderMenuItemsList(
  items: typeof siteConfig.userMenuItems,
  t: ReturnType<typeof useTranslations>,
  renderMode: "mobile" | "desktop"
) {
  return items.map((item) => {
    if (renderMode === "mobile") {
      return (
        <MobileMenuItem
          key={`mobile-${item.key}`}
          href={item.href}
          icon={item.icon}
        >
          {t("menuItems." + item.key)}
        </MobileMenuItem>
      )
    }

    return (
      <DropdownMenuItem asChild key={`desktop-${item.key}`}>
        <Link href={item.href}>
          <item.icon className="h-4 w-4" />
          {t("menuItems." + item.key)}
        </Link>
      </DropdownMenuItem>
    )
  })
}

// ============================================================================
// 🌐 Language Selector Component (Reusable)
// ============================================================================
interface LanguageSelectorProps {
  locale: string
  onLocaleChange: (locale: string) => void
  t: ReturnType<typeof useTranslations>
  mode: "mobile" | "desktop"
}

function LanguageSelector({
  locale,
  onLocaleChange,
  t,
  mode,
}: LanguageSelectorProps) {
  const languages = React.useMemo(
    () => [
      { key: "ar", label: t("menuItems.arabic") },
      { key: "en", label: t("menuItems.english") },
    ],
    [t]
  )

  if (mode === "mobile") {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="language">
          <AccordionTrigger className="p-0">
            <MobileMenuItem key="language" icon={GlobeIcon} className="w-auto">
              {t("menuItems.language")}
            </MobileMenuItem>
          </AccordionTrigger>
          <AccordionContent>
            {languages.map((lang) => (
              <MobileMenuItem
                key={lang.key}
                className={locale === lang.key ? "" : "ml-9 rtl:mr-9 rtl:ml-0"}
                onClick={() => onLocaleChange(lang.key)}
              >
                {locale === lang.key && (
                  <CheckIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                )}
                {lang.label}
              </MobileMenuItem>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  // Desktop version using DropdownMenuSub
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <GlobeIcon className="h-4 w-4" />
        {t("menuItems.language")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {languages.map((lang) => (
            <DropdownMenuCheckboxItem
              key={lang.key}
              checked={locale === lang.key}
              onCheckedChange={() => onLocaleChange(lang.key)}
            >
              {lang.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

// ============================================================================
// 🎨 Theme Selector Component (Reusable)
// ============================================================================
interface ThemeSelectorProps {
  theme: string
  onThemeChange: (theme: string) => void
  t: ReturnType<typeof useTranslations>
  mode: "mobile" | "desktop"
}

function ThemeSelector({ theme, onThemeChange, t, mode }: ThemeSelectorProps) {
  const themes = React.useMemo(
    () => [
      { key: "system", label: t("menuItems.system") },
      { key: "dark", label: t("menuItems.dark") },
      { key: "light", label: t("menuItems.light") },
    ],
    [t]
  )

  if (mode === "mobile") {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="theme">
          <AccordionTrigger className="p-0">
            <MobileMenuItem
              key="theme"
              icon={ThemeModeIcon}
              className="w-auto"
              suppressHydrationWarning
            >
              {t("menuItems.theme")}
            </MobileMenuItem>
          </AccordionTrigger>
          <AccordionContent>
            {themes.map((tOption) => (
              <MobileMenuItem
                key={tOption.key}
                className={
                  theme === tOption.key ? "" : "ml-9 rtl:mr-9 rtl:ml-0"
                }
                onClick={() => onThemeChange(tOption.key)}
              >
                {theme === tOption.key && (
                  <CheckIcon className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                )}
                {tOption.label}
              </MobileMenuItem>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  // Desktop version using DropdownMenuSub
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ThemeModeIcon className="h-4 w-4" />
        {t("menuItems.theme")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {themes.map((tOption) => (
            <DropdownMenuCheckboxItem
              key={tOption.key}
              checked={theme === tOption.key}
              onCheckedChange={() => onThemeChange(tOption.key)}
            >
              {tOption.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

// ============================================================================
// 👤 UserMenu Component (Desktop) - Receives props to avoid hook duplication
// ============================================================================
interface UserMenuProps {
  avatar: string | undefined
  menuItems: typeof siteConfig.userMenuItems
  handleLogout: () => Promise<void>
  handleLocaleChange: (locale: string) => void
  handleThemeChange: (theme: string) => void
}

function UserMenu({
  avatar,
  menuItems,
  handleLogout,
  handleLocaleChange,
  handleThemeChange,
}: UserMenuProps) {
  const { theme, locale, t, user, isLoading, profile } = useHeaderLogic()

  // ✅ Memoize dropdown content to prevent re-rendering on parent updates
  const dropdownContent = React.useMemo(() => {
    if (isLoading) return null

    return (
      <DropdownMenuContent
        className="w-62"
        align={locale === "ar" ? "start" : "end"}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={appRouter.home}>
              <HomeIcon className="h-4 w-4" />
              {t("menuItems.home")}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={appRouter.home}>
              <PackageIcon className="h-4 w-4" />
              {t("menuItems.products")}
            </Link>
          </DropdownMenuItem>

          {user && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t("menuItems.account")}</DropdownMenuLabel>
            </>
          )}

          {renderMenuItemsList(menuItems, t, "desktop")}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <LanguageSelector
            locale={locale}
            onLocaleChange={handleLocaleChange}
            t={t}
            mode="desktop"
          />
          <ThemeSelector
            theme={theme}
            onThemeChange={handleThemeChange}
            t={t}
            mode="desktop"
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={appRouter.home}>
              <LifeBuoyIcon className="h-4 w-4" />
              {t("menuItems.support")}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={appRouter.home}>
              <BookIcon className="h-4 w-4" />
              {t("menuItems.documentation")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>
                {t("signOut")}
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    )
  }, [
    isLoading,
    locale,
    t,
    user,
    menuItems,
    theme,
    handleLocaleChange,
    handleThemeChange,
    handleLogout,
    profile,
  ])

  // ✅ Better loading state with skeleton
  if (isLoading) {
    return <div className="size-8 animate-pulse rounded-full bg-muted" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
          <Button size="icon-sm" className="shadow-none">
            <EllipsisVerticalIcon />
          </Button>
        )}
      </DropdownMenuTrigger>
      {dropdownContent}
    </DropdownMenu>
  )
}

// ============================================================================
// 🚀 Main Header Component
// ============================================================================
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const {
    theme,
    locale,
    t,
    profile,
    user,
    isLoading,
    avatar,
    menuItems,
    handleLogout,
    handleLocaleChange,
    handleThemeChange,
  } = useHeaderLogic()

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-12 items-center gap-4 px-4">
          {/* Logo - Left */}
          <div className="flex basis-1/3 items-center justify-start">
            <AppLogo />
          </div>

          {/* Search - Center (macOS Spotlight style) */}
          <div className="flex basis-1/3 items-center justify-center">
            <Button
              variant="secondary"
              className="h-8 w-full max-w-md gap-2 rounded-full bg-background px-3 text-sm text-muted-foreground shadow-none hover:bg-background/80"
            >
              <SearchIcon className="size-4" />
              <span>{t("search")}</span>
            </Button>
          </div>

          {/* User Avatar / Menu - Right */}
          <nav className="flex basis-1/3 items-center justify-end gap-2">
            <div className="hidden items-center lg:flex">
              <ButtonGroup>
                {!user && (
                  <Button size="sm" className="px-6 shadow-none">
                    <Link href={appRouter.signIn}>
                      <span>{t("getStarted")}</span>
                    </Link>
                  </Button>
                )}
                <UserMenu
                  avatar={avatar}
                  menuItems={menuItems}
                  handleLogout={handleLogout}
                  handleLocaleChange={handleLocaleChange}
                  handleThemeChange={handleThemeChange}
                />
              </ButtonGroup>
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

      {/* ✅ Mobile Menu - Fixed typo: "Monile Mwnu" → "Mobile Menu" */}
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

          {/* ✅ Reuse menu items renderer */}
          {renderMenuItemsList(menuItems, t, "mobile")}

          {/* ✅ Reuse Language & Theme selectors */}
          <LanguageSelector
            locale={locale}
            onLocaleChange={handleLocaleChange}
            t={t}
            mode="mobile"
          />
          <ThemeSelector
            theme={theme}
            onThemeChange={handleThemeChange}
            t={t}
            mode="mobile"
          />

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
          {/* ✅ Improved loading state */}
          {isLoading ? (
            <Button variant="ghost" className="w-full" disabled>
              Loading...
            </Button>
          ) : user ? (
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
