import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
} from "@/components/shared/icons"
import { AppLogo } from "@/components/ui/app-logo"
import {
  ArrowUpRight,
  ChartColumnStacked,
  CircleQuestionMark,
  Currency,
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
  ShoppingCart,
  Store,
  Sun,
  SunMoon,
  Ticket,
  Truck,
  Undo2,
  User2,
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
    userMenu: {
      name: "User Menu",
      description: "User Menu",
      icon: User2,
      items: [
        {
          label: "Dashboard",
          key: "dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Orders",
          key: "orders",
          href: "/dashboard/orders",
          icon: Package,
        },
        { label: "Wishlist", key: "wishlist", href: "/wishlist", icon: Heart },
        { label: "My Coupons", key: "coupons", href: "coupons", icon: Ticket },
      ],
    },

    shoppingMenu: {
      name: "Shopping",
      description: "Shopping menu",
      icon: User2,
      items: [
        { label: "Store", key: "store", href: "/", icon: Store },
        { label: "Products", key: "products", href: "products", icon: Package },
      ],
    },

    supportLinksMenu: {
      name: "Support Links",
      description: "Support Links",
      icon: User2,
      items: [
        { label: "About", key: "about", href: "/about", icon: Info },
        { label: "Contact", key: "contact", href: "/contact", icon: Mail },
        { label: "Shipping", key: "shipping", href: "/shipping", icon: Truck },
        { label: "Returns", key: "returns", href: "/returns", icon: Undo2 },
        { label: "Faq", key: "faq", href: "/faq", icon: CircleQuestionMark },
        {
          label: "Terms and Privacy",
          key: "terms-and-privacy",
          href: "/terms-and-privacy",
          icon: Info,
        },
      ],
    },

    gestMenu: {
      name: "Guest Menu",
      description: "Guest Menu",
      icon: User2,
      items: [
        { label: "Home", key: "home", href: "/", icon: House },
        { label: "Store", key: "store", href: "/", icon: Store },
        { label: "Products", key: "products", href: "products", icon: Package },
      ],
    },

    preferences: {
      name: "Preferences",
      description: "Select your preferred language and theme",
      language: {
        name: "Language",
        description: "Select your preferred language",
        icon: Languages,
        targetLanguage: "en",
        options: [
          { label: "عربي", key: "ar", value: "ar" },
          { label: "English", key: "en", value: "en" },
        ],
      },
      appearance: {
        name: "Appearance",
        description: "Select your preferred appearance",
        icon: SunMoon,
        targetTheme: "light",
        options: [
          { label: "Light", key: "light", value: "light", icon: Sun },
          { label: "Dark", key: "dark", value: "dark", icon: Moon },
          { label: "System", key: "system", value: "system", icon: Monitor },
        ],
      },
      currency: {
        name: "Currency",
        description: "Select your preferred currency",
        icon: Currency,
        targetCurrency: "USD",
        supportedCurrencies: ["USD", "SYP", "SAR", "EGP", "TRY", "EUR", "AED"],
        options: [
          { label: "USD", key: "USD", value: "USD", symbol: "$" },
          { label: "SYP", key: "SYP", value: "SYP", symbol: "ل.س" },
          { label: "SAR", key: "SAR", value: "SAR", symbol: "ر.س" },
          { label: "EGP", key: "EGP", value: "EGP", symbol: "ج.م" },
          { label: "TRY", key: "TRY", value: "TRY", symbol: "₺" },
          { label: "EUR", key: "EUR", value: "EUR", symbol: "€" },
          { label: "AED", key: "AED", value: "AED", symbol: "د.ا" },
        ],
      },
    },

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

    mainNavbarMenu: {
      name: "Main Navbar Menu",
      description: "Main Navbar Menu",
      icon: ArrowUpRight,
      items: [
        { label: "Home", key: "home", href: "/", icon: House },
        { label: "Store", key: "store", href: "/", icon: Store },
        { label: "Products", key: "products", href: "products", icon: Package },
        { label: "About", key: "about", href: "about", icon: Info },
      ],
    },

    quickLinks: {
      name: "Quick Links",
      description: "Quick Links",
      icon: ArrowUpRight,
      items: [
        { label: "Home", key: "home", href: "/", icon: House },
        { label: "Store", key: "store", href: "/", icon: Store },
        { label: "Products", key: "products", href: "products", icon: Package },
        { label: "About", key: "about", href: "about", icon: Info },
      ],
    },

    supportLinks: {
      name: "Support Links",
      description: "Support Links",
      icon: ArrowUpRight,
      items: [
        {
          label: "Contact",
          key: "contact",
          href: "/contact",
          icon: Mail,
        },
        {
          label: "Faq",
          key: "faq",
          href: "/faq",
          icon: CircleQuestionMark,
        },
        {
          label: "Shipping",
          key: "shipping",
          href: "/shipping",
          icon: Truck,
        },
        {
          label: "Returns",
          key: "returns",
          href: "/returns",
          icon: Undo2,
        },
        {
          label: "Terms & Privacy",
          key: "terms&privacy",
          href: "/terms&privacy",
          icon: ShieldCheck,
        },
      ],
    },

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
            title: "Categories",
            url: "/dashboard/categories",
            icon: ChartColumnStacked,
          },
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
