"use client";
import React from "react";
import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/lib/config/site_config";

export const MobileMenu = ({
  isOpen,
  setIsOpen,
}: {
  isOpen?: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const router = useRouter();
  const { profile, user, signOut } = useAuth()
  const menuItems = user ? siteConfig.userMenuItems : siteConfig.guestMenuItems;

  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      // دالة التنظيف: تعيد النمط الأصلي عند إغلاق القائمة أو مغادرة الصفحة
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleLogout = async () => {
    const response = await signOut();

    router.refresh();
  };

  return (
    <div
      className={`fixed inset-0 top-14 z-50 transition-opacity duration-300 md:hidden ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className={`absolute left-0 h-screen w-full transform border-t border-r bg-background transition-transform duration-300 ease-in-out rtl:right-0 rtl:left-0 ${
          isOpen
            ? "translate-x-0"
            : "ltr:-translate-x-full rtl:translate-x-full"
        }`}
      >
        <nav className="flex h-[calc(100vh-7rem)] flex-col">
          {/* Header */}
          <div className="h-20 shrink-0 border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  alt={profile?.full_name || ""}
                />
                <AvatarFallback>
                  <UserIcon />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-base leading-none font-semibold">
                  {profile?.full_name || ""}
                </span>
                <span className="text-sm text-muted-foreground">
                  {profile?.email || ""}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="grow overflow-y-auto p-2">
            <nav className="grid gap-2">
              {menuItems.map((item) => (
                <Button
                  key={`/${item.label}`}
                  variant="ghost"
                  className="h-10 w-full justify-start gap-3 text-base"
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
            </nav>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t bg-card p-4">
            {user ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  className="w-full"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href={`/auth/login`} className="flex-1">
                    Sign In
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href={`/auth/signup`} className="flex-1">
                    Create Account
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
};
