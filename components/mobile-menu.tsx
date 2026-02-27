"use client";
import React from "react"
import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import { useRouter } from "next/navigation";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/provider/user-provider";
import { signOut } from "@/lib/actions/auth";
import { toast } from "sonner";

export const MobileMenu = ({ isOpen, setIsOpen }: { isOpen?: boolean ; setIsOpen: (isOpen: boolean) => void }) => {
  const router = useRouter();
  const { user } = useUser();
  const { fullName, avatarUrl, email } = useUserDisplay(user);
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
    const { error } = await signOut();
    if (error) {
      toast.error(error);
    }
    router.refresh();
  };

  return (
    <div
      className={`fixed inset-0 top-14 z-50 md:hidden transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
    

      <div
        className={`absolute border-t right-0 h-screen w-full bg-background shadow-2xl transform transition-transform duration-300 ease-in-out border-l ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col justify-between h-[calc(100vh-7rem)]">
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
            <nav className="grid gap-2">
              {menuItems.map((item) => (
                <Button
                  key={`/${item.label}`}
                  variant="ghost"
                  className="w-full justify-start text-base gap-3 h-10"
                  asChild
                  // **الإصلاح رقم 2: إغلاق القائمة عند الضغط على الرابط**
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
              <div className="flex gap-2">
                <Button
                  className="w-full"
                  asChild
                  // **الإصلاح رقم 2 (مكرر): إغلاق القائمة**
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
                  // **الإصلاح رقم 2 (مكرر): إغلاق القائمة**
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
  );
};
