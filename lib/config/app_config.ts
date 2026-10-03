import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
} from "@/components/shared/icons"
import { AppLogo } from "@/components/ui/app-logo"
import {
  ArrowUpRight,
  ChartColumnStacked,
  Package,
  ShieldCheckIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"

export const APP_NAME = "Marketna"

export const appConfig = {
  name: APP_NAME,
  description: `Marketna: Your smart destination for everyday essentials where quality, variety, and speed come together.`,
  url: "https://marketna.vercel.app",
  robots: "index, follow",
  keywords: [
    "Marketna",
    "E-commerce",
    "Fresh Food",
    "Grocery",
    "Delivery Saudi Arabia",
    "ماركتنا",
    "تسوق أونلاين",
    "توصيل سريع",
    "مواد غذائية",
  ],
  locale: "en_US",
  twitterHandle: "@marketna",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  defaultLocale: "en",
  locales: ["en", "ar"],
  localePrefix: "never",

  allowedRoles: ["admin", "customer"],

  menu: {
    // روابط التواصل الاجتماعي (تُستخدم غالباً في الفوتر)
    socialMediaLinks: {
      name: "Social Media Links",
      description: "Social Media Links",
      icon: ArrowUpRight,
      items: [
        {
          label: "X",
          key: "x",
          href: "https://x.com/marketna",
          icon: TwitterIcon,
        },
        {
          label: "Facebook",
          key: "facebook",
          href: "https://www.facebook.com/marketna",
          icon: FacebookIcon,
        },
        {
          label: "Instagram",
          key: "instagram",
          href: "https://www.instagram.com/marketna",
          icon: InstagramIcon,
        },
      ],
    },

    // قوائم لوحة التحكم الإدارية والعملاء
    dashboard: {
      adminMenu: {
        teams: [
          {
            name: APP_NAME,
            logo: AppLogo,
            plan: "Admin Plan",
          },
        ],
        navMain: [
          {
            title: "Products",
            url: "/dashboard/products",
            icon: Package,
            isActive: false,
          },
          {
            title: "Flash Sales",
            url: "/dashboard/flash-sales",
            icon: ZapIcon,
            isActive: false,
          },
          {
            title: "Roles & Permissions",
            url: "/dashboard/roles",
            icon: ShieldCheckIcon,
            isActive: false,
          },
          {
            title: "Users Management",
            url: "/dashboard/users",
            icon: UsersIcon,
            isActive: false,
          },
        ],
      },

      customerMenu: {
        teams: [
          {
            name: APP_NAME,
            logo: AppLogo,
            plan: "Customer Plan",
          },
        ],
        navMain: [
          {
            title: "Products",
            url: "#",
            icon: Package,
            isActive: false,
            items: [
              {
                title: "All Products",
                url: "/dashboard/products",
              },
              {
                title: "Add New Product",
                url: "/dashboard/products/new",
              },
            ],
          },
          {
            title: "Categories",
            url: "#",
            icon: ChartColumnStacked,
            items: [
              {
                title: "All Categories",
                url: "/dashboard/categories",
              },
              {
                title: "Add New Category",
                url: "/dashboard/categories/new",
              },
            ],
          },
        ],
      },
    },
  },
}
