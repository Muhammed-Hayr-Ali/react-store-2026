"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  PackageIcon,
  FolderTreeIcon,
  ShoppingCartIcon,
  UsersIcon,
  HeadphonesIcon,
  SettingsIcon,
  UserIcon,
  MapPinIcon,
  HeartIcon,
  ListOrderedIcon,
  TicketIcon,
  QrCodeIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/providers/auth-provider";

// =====================================================
// 🗺️ Navigation Configuration by Role
// =====================================================

interface NavItem {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: { title: string; url: string }[];
}

const adminNav: NavItem[] = [
  {
    title: "لوحة التحكم",
    url: "/dashboard/admin",
    icon: <LayoutDashboardIcon className="size-4" />,
    isActive: true,
  },
  {
    title: "المنتجات",
    url: "/dashboard/admin/products",
    icon: <PackageIcon className="size-4" />,
    items: [
      { title: "جميع المنتجات", url: "/dashboard/admin/products" },
      { title: "إضافة منتج جديد", url: "/dashboard/admin/products/new" },
      { title: "التصنيفات", url: "/dashboard/admin/categories" },
    ],
  },
  {
    title: "الطلبات",
    url: "/dashboard/admin/orders",
    icon: <ShoppingCartIcon className="size-4" />,
    items: [
      { title: "جميع الطلبات", url: "/dashboard/admin/orders" },
      {
        title: "الطلبات المعلقة",
        url: "/dashboard/admin/orders?status=pending",
      },
    ],
  },
  {
    title: "المستخدمين",
    url: "/dashboard/admin/users",
    icon: <UsersIcon className="size-4" />,
  },
  {
    title: "الدعم الفني",
    url: "/dashboard/admin/support",
    icon: <HeadphonesIcon className="size-4" />,
  },
  {
    title: "الإعدادات",
    url: "/dashboard/admin/settings",
    icon: <SettingsIcon className="size-4" />,
  },
];

const vendorNav: NavItem[] = [
  {
    title: "لوحة التحكم",
    url: "/dashboard/admin",
    icon: <LayoutDashboardIcon className="size-4" />,
    isActive: true,
  },
  {
    title: "المنتجات",
    url: "/dashboard/admin/products",
    icon: <PackageIcon className="size-4" />,
    items: [
      { title: "جميع المنتجات", url: "/dashboard/admin/products" },
      { title: "إضافة منتج جديد", url: "/dashboard/admin/products/new" },
    ],
  },
  {
    title: "الطلبات",
    url: "/dashboard/admin/orders",
    icon: <ShoppingCartIcon className="size-4" />,
  },
  {
    title: "الإعدادات",
    url: "/dashboard/admin/settings",
    icon: <SettingsIcon className="size-4" />,
  },
];

const deliveryNav: NavItem[] = [
  {
    title: "طلبات اليوم",
    url: "/dashboard/delivery",
    icon: <ListOrderedIcon className="size-4" />,
    isActive: true,
  },
  {
    title: "مسح QR Code",
    url: "/dashboard/delivery/scan",
    icon: <QrCodeIcon className="size-4" />,
  },
  {
    title: "خريطة التوصيل",
    url: "/dashboard/delivery/map",
    icon: <MapPinIcon className="size-4" />,
  },
];

const customerNav: NavItem[] = [
  {
    title: "ملخص الحساب",
    url: "/dashboard/account",
    icon: <UserIcon className="size-4" />,
    isActive: true,
  },
  {
    title: "الطلبات",
    url: "/dashboard/account/orders",
    icon: <ShoppingCartIcon className="size-4" />,
    items: [
      { title: "سجل الطلبات", url: "/dashboard/account/orders" },
      { title: "تتبع طلب", url: "/dashboard/account/orders/track" },
    ],
  },
  {
    title: "الملف الشخصي",
    url: "/dashboard/account/profile",
    icon: <UserIcon className="size-4" />,
  },
  {
    title: "العناوين",
    url: "/dashboard/account/addresses",
    icon: <MapPinIcon className="size-4" />,
  },
  {
    title: "المفضلة",
    url: "/dashboard/account/favorites",
    icon: <HeartIcon className="size-4" />,
  },
  {
    title: "تذاكر الدعم",
    url: "/dashboard/account/tickets",
    icon: <TicketIcon className="size-4" />,
  },
];

// خريطة الأدوار
const roleNavigation: Record<string, NavItem[]> = {
  admin: adminNav,
  vendor: vendorNav,
  delivery: deliveryNav,
  customer: customerNav,
};

export function AppSidebar({
  userRole,
  ...props
}: React.ComponentProps<typeof Sidebar> & { userRole: string }) {
  const { profile: fullProfile } = useAuth();
  const locale = useLocale();
  const side = locale === "en" ? "left" : "right";

  const user = {
    name: fullProfile?.profile.full_name ?? "User",
    email: fullProfile?.profile.email ?? "user@example.com",
    avatar: fullProfile?.profile.avatar_url ?? "/avatars/default.jpg",
  };

  // جلب القائمة المناسبة للدور
  const navItems = roleNavigation[userRole] || customerNav;

  return (
    <Sidebar side={side} collapsible="icon" {...props}>
      <SidebarHeader />

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
