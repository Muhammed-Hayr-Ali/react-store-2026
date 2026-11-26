/**
 * @file lib/config/app_config.ts
 * @description الإعدادات المركزية للتطبيق، تشمل الروابط، العملات، اللغات، والثيمات.
 */

import {
  Coins,
  Languages,
  Monitor,
  Moon,
  Sun,
  SunMoon,
  type LucideIcon,
} from "lucide-react"
import { AppPermission } from "@/lib/actions/role"

// ==========================================
// 1. العملات المدعومة (SUPPORTED_CURRENCIES) - [تمت إضافة export]
// ==========================================
export const SUPPORTED_CURRENCIES = {
  SYP: {
    key: "SYP",
    code: "SYP",
    name: "Syrian Pound",
    name_ar: "ليرة سورية",
    symbol: "ل.س",
    locale: "ar-SY",
  },
  USD: {
    key: "USD",
    code: "USD",
    name: "US Dollar",
    name_ar: "دولار أمريكي",
    symbol: "$",
    locale: "en-US",
  },
} as const

// ==========================================
// 2. اللغات المدعومة (SUPPORTED_LANGUAGES)
// ==========================================
export const SUPPORTED_LANGUAGES = {
  ar: { key: "ar", code: "ar", name: "العربية", name_ar: "العربية" },
  en: { key: "en", code: "en", name: "English", name_ar: "الإنجليزية" },
} as const

// ==========================================
// 3. الثيمات المدعومة (SUPPORTED_THEMES)
// ==========================================
export const SUPPORTED_THEMES = {
  light: {
    key: "light",
    code: "light",
    name: "Light",
    name_ar: "فاتح",
    icon: Sun,
  },
  dark: {
    key: "dark",
    code: "dark",
    name: "Dark",
    name_ar: "داكن",
    icon: Moon,
  },
  system: {
    key: "system",
    code: "system",
    name: "System",
    name_ar: "النظام",
    icon: Monitor,
  },
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

export const PREFERENCES_CONFIG = {
  language: {
    name: "language",
    icon: Languages,
    options: Object.values(SUPPORTED_LANGUAGES).map(
      (lang): PreferenceOption => ({
        label: lang.name,
        key: lang.key,
        value: lang.code,
      })
    ),
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
