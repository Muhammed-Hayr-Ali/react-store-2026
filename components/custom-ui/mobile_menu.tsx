"use client";

import {
  Sun,
  Moon,
  Laptop,
  Globe,
  User as UserIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import MenuButton from "./menu_button";
import { useAuth } from "../../lib/provider/auth-provider";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import React from "react";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchButton } from "./search-button";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { CartIcon } from "../dashboard/cart/CartIcon";

export const MobileNav = () => {
  return (
    <div className="flex items-center lg:hidden">
      <CartIcon />
      <MobileMenu />
    </div>
  );
};

const MobileMenu = () => {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const { fullName, avatarUrl, email } = useUserDisplay(user);
  const { theme, setTheme } = useTheme();
  const menuItems = user ? siteConfig.userMenuItems : siteConfig.guestMenuItems;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // حفظ حالة التمرير الحالية
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  React.useEffect(() => {
    const initializeMounted = async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // Introduce a small delay
      setMounted(true);
    };
    initializeMounted();
  }, []);

  const handleChangeLocale = (selectedLocale: string) => {
    if (selectedLocale && selectedLocale !== locale) {
      const newPath = pathname.replace(`/${locale}`, "");
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/${selectedLocale}${newPath}?${params.toString()}`);
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    signOut();
    router.refresh();
  };

  return (
    <div>
      <MenuButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      <div
        className={`fixed top-14 right-0 left-0 w-full border-t bg-background z-40 transform ${
          isOpen
            ? "translate-x-0"
            : locale == "ar"
              ? "-translate-x-full"
              : "translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
        style={{ height: "calc(100dvh - 56px)" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-20 shrink-0 p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback>
                  <UserIcon />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-base font-semibold leading-none">
                  {fullName}
                </span>
                <span className="text-sm text-muted-foreground">{email}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="grow overflow-y-auto p-2">
            <nav className="grid gap-2  ">
              {menuItems.map((item) => (
                <Button
                  key={`/${locale}/${item.label}`}
                  variant="ghost"
                  className="w-full justify-start text-base gap-3 h-10"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>
              ))}

              <Accordion type="single" collapsible className="w-full gap-2">
                {/* Theme Switcher */}
                {mounted && (
                  <AccordionItem value="theme" className="border-none">
                    <AccordionTrigger className="text-base h-10 px-2 hover:no-underline hover:bg-accent flex items-center gap-3">
                      {theme === "light" && <Sun className="h-5 w-5" />}
                      {theme === "dark" && <Moon className="h-5 w-5" />}
                      {theme === "system" && <Laptop className="h-5 w-5" />}
                      Theme
                    </AccordionTrigger>
                    <AccordionContent className="ltr:pl-8 ltr:pr-2 rtl:pl-2 rtl:pr-8 ">
                      <Button
                        variant="ghost"
                        className="relative w-full justify-start gap-3"
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-5 w-5" /> Light
                        {theme === "light" && (
                          <span className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-2 ">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="relative w-full justify-start gap-3"
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-5 w-5" /> Dark
                        {theme === "dark" && (
                          <span className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-2 ">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="relative w-full justify-start gap-3"
                        onClick={() => setTheme("system")}
                      >
                        <Laptop className="h-5 w-5" /> System
                        {theme === "system" && (
                          <span className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-2 ">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {/* Language Switcher */}
                <AccordionItem value="language" className="border-none">
                  <AccordionTrigger className="text-base h-10 px-2 hover:no-underline hover:bg-accent flex items-center gap-3">
                    <Globe className="h-5 w-5" /> Language
                  </AccordionTrigger>
                  <AccordionContent className="ltr:pl-8 ltr:pr-2 rtl:pl-2 rtl:pr-8 ">
                    <Button
                      variant="ghost"
                      className="relative w-full justify-start gap-3"
                      onClick={() => handleChangeLocale("ar")}
                    >
                      العربية
                      {locale === "ar" && (
                        <span className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-2 ">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="relative w-full justify-start gap-3"
                      onClick={() => handleChangeLocale("en")}
                    >
                      English
                      {locale === "en" && (
                        <span className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-2 ">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <DropdownMenuSeparator className="my-3" />

              <SearchButton />
            </nav>
          </div>

          {/* Footer */}
          <div className="shrink-0 p-4 border-t bg-card">
            {user ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            ) : (
              <div className="flex gap-2 ">
                <Button className="w-full" asChild>
                  <Link href={`/${locale}/auth/login`} className="flex-1">
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${locale}/auth/signup`} className="flex-1">
                    Create Account
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
