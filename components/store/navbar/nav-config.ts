import {
  CircleQuestionMark,
  Coins,
  Heart,
  House,
  Info,
  Languages,
  LayoutDashboard,
  Mail,
  Monitor,
  Moon,
  Package,
  ShieldCheck,
  Store,
  Sun,
  SunMoon,
  Ticket,
  Truck,
  Undo2,
  type LucideIcon,
} from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"
import { PERMISSIONS } from "@/lib/actions/role"

export interface StoreNavItem {
  label: string
  key: string
  href: string
  icon: LucideIcon
  requiredPermission?: string
}

export interface StoreNavSection {
  name: string
  description?: string
  items: readonly StoreNavItem[]
}

export const storeNavConfig = {
  // قائمة الزائر غير المسجل بدون طلاحيات
  guestMenu: {
    name: "Guest Menu",
    description: "Navigation items for unauthenticated visitors",
    items: [
      { label: "Home", key: "home", href: appRoutes.home, icon: House },
      { label: "Store", key: "store", href: appRoutes.home, icon: Store },
      { label: "Products", key: "products", href: "/products", icon: Package },
    ],
  },

  // قائمة حساب المستخدم
  userMenu: {
    name: "User Menu",
    description: "Account and profile quick navigation",
    items: [
      {
        label: "Dashboard",
        key: "user-dashboard",
        href: appRoutes.dashboard.user.overview, // مسار لوحة العميل المباشر
        icon: LayoutDashboard,
        requiredPermission: PERMISSIONS.VIEW_USER_OVERVIEW,
      },
      {
        label: "Admin Panel", // أو "Admin Dashboard"
        key: "admin-dashboard",
        href: appRoutes.dashboard.admin.overview, // مسار لوحة الإدارة المباشر
        icon: ShieldCheck, // أو LayoutDashboard
        requiredPermission: PERMISSIONS.VIEW_ADMIN_OVERVIEW,
      },
      {
        label: "Orders",
        key: "orders",
        href: "appRoutes.dashboard.user.orders",
        icon: Package,
        requiredPermission: PERMISSIONS.VIEW_USER_ORDERS,
      },
      {
        label: "Wishlist",
        key: "wishlist",
        href: "/wishlist",
        icon: Heart,
        requiredPermission: PERMISSIONS.VIEW_USER_WISHLIST,
      },
      {
        label: "My Coupons",
        key: "coupons",
        href: "/coupons",
        icon: Ticket,
        requiredPermission: PERMISSIONS.VIEW_USER_COUPONS,
      },
    ],
  },

  // قائمة مشتريات المتجر
  shoppingMenu: {
    name: "Shopping",
    description: "Direct store shopping links",
    items: [
      { label: "Store", key: "store", href: appRoutes.home, icon: Store },
      { label: "Products", key: "products", href: "/products", icon: Package },
    ],
  },

  // قائمة الدعم والمساعدة
  supportLinks: {
    name: "Support Links",
    description: "Customer service and informational pages",
    items: [
      { label: "About", key: "about", href: "/about", icon: Info },
      { label: "Contact", key: "contact", href: "/contact", icon: Mail },
      { label: "Shipping", key: "shipping", href: "/shipping", icon: Truck },
      { label: "Returns", key: "returns", href: "/returns", icon: Undo2 },
      { label: "Faq", key: "faq", href: "/faq", icon: CircleQuestionMark },
      {
        label: "Terms & Privacy",
        key: "terms-and-privacy",
        href: "/terms-and-privacy",
        icon: ShieldCheck,
      },
    ],
  },

  // قائمة روابط الواجهة الرئيسية (Desktop)
  mainNavbarMenu: {
    name: "Main Navbar Menu",
    description: "Primary top bar navigation links",
    items: [
      { label: "Home", key: "home", href: appRoutes.home, icon: House },
      { label: "Store", key: "store", href: appRoutes.home, icon: Store },
      { label: "Products", key: "products", href: "/products", icon: Package },
      { label: "About", key: "about", href: "/about", icon: Info },
    ],
  },

  // إعدادات وتفضيلات المستخدم المضمنة
  preferences: {
    language: {
      name: "Language",
      icon: Languages,
      options: [
        { label: "عربي", key: "ar", value: "ar" },
        { label: "English", key: "en", value: "en" },
      ],
    },
    appearance: {
      name: "Appearance",
      icon: SunMoon,
      options: [
        { label: "Light", key: "light", value: "light", icon: Sun },
        { label: "Dark", key: "dark", value: "dark", icon: Moon },
        { label: "System", key: "system", value: "system", icon: Monitor },
      ],
    },
    currency: {
      name: "Currency",
      icon: Coins,
    },
  },
} as const

export type StoreNavConfig = typeof storeNavConfig
