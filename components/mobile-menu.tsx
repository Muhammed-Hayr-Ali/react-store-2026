"use client";

import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import MenuButton from "./custom-ui/menu_button";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import React from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";
import { toast } from "sonner";
import { useUser } from "@/lib/provider/user-provider";
import { cn } from "@/lib/utils";

export const MobileMenu = ({ className }: { className?: string }) => {
  const router = useRouter();
  const locale = useLocale();
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useUser();
  const { fullName, avatarUrl, email } = useUserDisplay(user);
  const menuItems = user ? siteConfig.userMenuItems : siteConfig.guestMenuItems;

  React.useEffect(() => {
    if (isOpen) {
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

   const handleLogout = async () => {
    setIsOpen(false);
    
     const { error } = await signOut();
     if (error) {
       toast.error(error);
     }
     router.refresh();
   };

  return (
    <div className={cn("", className)}>
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
                  key={`/${item.label}`}
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

              <DropdownMenuSeparator className="my-3" />

              {/* <SearchButton /> */}
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
                  <Link href={`/auth/login`} className="flex-1">
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/auth/signup`} className="flex-1">
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
