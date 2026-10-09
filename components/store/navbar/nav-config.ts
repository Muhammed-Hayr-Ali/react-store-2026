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
import { AppPermission, PERMISSIONS } from "@/lib/actions/role"

export const SUPPORTED_CURRENCIES = [
  { code: "USD", key: "USD", locale: "en-US", symbol: "\$" },
  { code: "SYP", key: "SYP", locale: "ar-SY", symbol: "ل.س" },
  { code: "SAR", key: "SAR", locale: "ar-SA", symbol: "ر.س" },
  { code: "EGP", key: "EGP", locale: "ar-EG", symbol: "ج.م" },
  { code: "TRY", key: "TRY", locale: "tr-TR", symbol: "₺" },
  { code: "EUR", key: "EUR", locale: "de-DE", symbol: "€" },
  { code: "AED", key: "AED", locale: "ar-AE", symbol: "د.إ" },
] as const

export interface NavLinkItem {
  title: string
  key: string
  url: string
  icon: LucideIcon
  requiredPermission?: AppPermission
  items?: {
    title: string
    url: string
    requiredPermission?: AppPermission
  }[]
  hasSeparator?: boolean
}

export interface PreferenceOption {
  label: string
  key: string
  value: string
  icon?: LucideIcon
}

export interface PreferenceSection {
  name: string
  icon: LucideIcon
  options: PreferenceOption[]
}

export const NAV_LINKS: NavLinkItem[] = [
  {
    title: "Home",
    key: "home",
    url: appRoutes.home,
    icon: House,
  },
  {
    title: "Store",
    key: "store",
    url: appRoutes.home,
    icon: Store,
    hasSeparator: true,
  },
  {
    title: "Dashboard",
    key: "user-dashboard",
    url: appRoutes.dashboard.user.overview,
    icon: LayoutDashboard,
    requiredPermission: PERMISSIONS.VIEW_USER_OVERVIEW,
  },
  {
    title: "Orders",
    key: "orders",
    url: "#",
    icon: Package,
    requiredPermission: PERMISSIONS.VIEW_USER_ORDERS,
  },
  {
    title: "Wishlist",
    key: "wishlist",
    url: "#",
    icon: Heart,
    requiredPermission: PERMISSIONS.VIEW_USER_WISHLIST,
  },
  {
    title: "My Coupons",
    key: "coupons",
    url: "#",
    icon: Ticket,
    requiredPermission: PERMISSIONS.VIEW_USER_COUPONS,
    hasSeparator: true,
  },
  {
    title: "Admin Dashboard",
    key: "admin-dashboard",
    url: appRoutes.dashboard.admin.overview,
    icon: ShieldCheck,
    requiredPermission: PERMISSIONS.VIEW_ADMIN_OVERVIEW,
    hasSeparator: true,
  },
  {
    title: "About Us",
    key: "about",
    url: "#",
    icon: Info,
  },
  {
    title: "Contact",
    key: "contact",
    url: "#",
    icon: Mail,
  },
  {
    title: "Shipping Policy",
    key: "shipping",
    url: "#",
    icon: Truck,
  },
  {
    title: "Returns & Refund",
    key: "returns",
    url: "#",
    icon: Undo2,
  },
  {
    title: "FAQ",
    key: "faq",
    url: "#",
    icon: CircleQuestionMark,
  },
  {
    title: "Terms & Privacy",
    key: "terms-and-privacy",
    url: "#",
    icon: ShieldCheck,
  },
]

export const PREFERENCES_CONFIG = {
  language: {
    name: "Language",
    icon: Languages,
    options: [
      { label: "العربية", key: "ar", value: "ar" },
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
    options: SUPPORTED_CURRENCIES.map((c) => ({
      label: `${c.code} (${c.symbol})`,
      key: c.key,
      value: c.code,
    })),
  },
} satisfies Record<string, PreferenceSection>