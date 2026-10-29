/**
 * @file lib/config/app_config.ts
 * @description الإعدادات المركزية للتطبيق، تشمل الروابط، العملات، اللغات، والثيمات.
 */

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
  Sun,
  SunMoon,
  Ticket,
  Truck,
  Undo2,
  type LucideIcon,
} from "lucide-react"
import { appRoutes } from "@/lib/config/app-routes"
import { AppPermission } from "@/lib/actions/role"

// ==========================================
// 1. العملات المدعومة (SUPPORTED_CURRENCIES) - [تمت إضافة export]
// ==========================================
export const SUPPORTED_CURRENCIES = {
  USD: { key: "USD", code: "USD", name: "US Dollar", name_ar: "دولار أمريكي", symbol: "$", locale: "en-US" },
  EUR: { key: "EUR", code: "EUR", name: "Euro", name_ar: "يورو", symbol: "€", locale: "de-DE" },
  SAR: { key: "SAR", code: "SAR", name: "Saudi Riyal", name_ar: "ريال سعودي", symbol: "ر.س", locale: "ar-SA" },
  AED: { key: "AED", code: "AED", name: "UAE Dirham", name_ar: "درهم إماراتي", symbol: "د.إ", locale: "ar-AE" },
  KWD: { key: "KWD", code: "KWD", name: "Kuwaiti Dinar", name_ar: "دينار كويتي", symbol: "د.ك", locale: "ar-KW" },
  QAR: { key: "QAR", code: "QAR", name: "Qatari Riyal", name_ar: "ريال قطري", symbol: "ر.ق", locale: "ar-QA" },
  BHD: { key: "BHD", code: "BHD", name: "Bahraini Dinar", name_ar: "دينار بحريني", symbol: "د.ب", locale: "ar-BH" },
  TRY: { key: "TRY", code: "TRY", name: "Turkish Lira", name_ar: "ليرة تركية", symbol: "₺", locale: "tr-TR" },
  EGP: { key: "EGP", code: "EGP", name: "Egyptian Pound", name_ar: "جنيه مصري", symbol: "ج.م", locale: "ar-EG" },
  IQD: { key: "IQD", code: "IQD", name: "Iraqi Dinar", name_ar: "دينار عراقي", symbol: "د.ع", locale: "ar-IQ" },
  SYP: { key: "SYP", code: "SYP", name: "Syrian Pound", name_ar: "ليرة سورية", symbol: "ل.س", locale: "ar-SY" },
} as const

// ==========================================
// 2. اللغات المدعومة (SUPPORTED_LANGUAGES)
// ==========================================
export const SUPPORTED_LANGUAGES = {
  ar: { key: "ar", code: "ar", name: "العربية", name_ar: "العربية" },
  en: { key: "en", code: "en", name: "English", name_ar: "الإنجليزية" },
  tr: { key: "tr", code: "tr", name: "Türkçe", name_ar: "التركية" },
  de: { key: "de", code: "de", name: "Deutsch", name_ar: "الألمانية" },
} as const

// ==========================================
// 3. الثيمات المدعومة (SUPPORTED_THEMES)
// ==========================================
export const SUPPORTED_THEMES = {
  light: { key: "light", code: "light", name: "Light", name_ar: "فاتح", icon: Sun },
  dark: { key: "dark", code: "dark", name: "Dark", name_ar: "داكن", icon: Moon },
  system: { key: "system", code: "system", name: "System", name_ar: "النظام", icon: Monitor },
} as const

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
    title: "Dashboard",
    key: "overview",
    url: appRoutes.dashboard.overview,
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    key: "orders",
    url: "#",
    icon: Package,
  },
  {
    title: "Wishlist",
    key: "wishlist",
    url: appRoutes.wishlist,
    icon: Heart,
  },
  {
    title: "My Coupons",
    key: "coupons",
    url: "#",
    icon: Ticket,
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
    title: "terms_and_privacy",
    key: "terms_and_privacy",
    url: "#",
    icon: ShieldCheck,
  },
]

export const PREFERENCES_CONFIG = {
  language: {
    name: "language",
    icon: Languages,
    options: Object.values(SUPPORTED_LANGUAGES).map((lang): PreferenceOption => ({
      label: lang.name,
      key: lang.key,
      value: lang.code,
    })),
  },
  appearance: {
    name: "appearance",
    icon: SunMoon,
    options: Object.values(SUPPORTED_THEMES).map((theme): PreferenceOption => ({
      label: theme.name,
      key: theme.key,
      value: theme.code,
      icon: theme.icon,
    })),
  },
  currency: {
    name: "currency",
    icon: Coins,
    options: Object.values(SUPPORTED_CURRENCIES).map((c): PreferenceOption => ({
      label: `${c.code} (${c.symbol})`,
      key: c.key,
      value: c.code,
    })),
  },
} satisfies Record<string, PreferenceSection>