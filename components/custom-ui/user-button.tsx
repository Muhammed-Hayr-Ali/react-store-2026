import { useAuth } from "@/lib/provider/auth-provider"; // <-- 1. استورد الخطاف (تأكد من المسار)
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
  UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { siteConfig } from "@/lib/config/site";
import { useUserDisplay } from "@/hooks/useUserDisplay";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const UserButton = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const { fullName, avatarUrl, email } = useUserDisplay(user);

  const handleChangeLocale = (selectedLocale: string) => {
    if (selectedLocale && selectedLocale !== locale) {
      const newPath = pathname.replace(`/${locale}`, "");
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/${selectedLocale}${newPath}?${params.toString()}`);
    }
  };

  if (!user) {
    return (
      <Button
        variant={"ghost"}
        asChild
        className="flex rounded-sm h-8 items-center  hover:bg-[#EBEBEB] dark:hover:bg-[#1F1F1F] justify-between w-fit px-2 py-2"
      >
        <Link href={`/${locale}/auth/login`} className="flex-1">
          <UserIcon size={16} />
        </Link>
      </Button>
    );
  }

  const handleLogout = () => {
    signOut();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user ? avatarUrl : undefined} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <span className="sr-only">User options</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mx-4">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm text-foreground">{fullName}</span>
              <span>{email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs" asChild>
            <Link href={`/${locale}/dashboard/orders`}>
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
                      siteConfig.locales.find((loc) => loc.locale === locale)
                        ?.locale || siteConfig.defaultLocale
                    }
                    onValueChange={handleChangeLocale}
                  >
                    {siteConfig.locales.map((loc) => (
                      <DropdownMenuRadioItem
                        key={loc.locale}
                        value={loc.locale}
                      >
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
          <Link href={`/${locale}/dashboard`}>
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
  );
};
