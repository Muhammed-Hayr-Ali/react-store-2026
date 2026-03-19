import { Book, Heart, Home, LayoutDashboard, LifeBuoy, Package, ShoppingCart, Ticket } from "lucide-react";

export const siteConfig = {
  name: "Marketna",
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

  lsnguages: [
    {
      name: "English",
      value: "en",
    },
    {
      name: "عربي",
      value: "ar",
    },
  ],

  targetCurrencies: ["SYP", "SAR", "EGP", "TRY", "EUR", "AED"],

  supportedCurrencies: [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "SYP", symbol: "ل.س", name: "Syrian Lira" },
    { code: "SAR", symbol: "ر.س", name: "Saudi Riyal" },
    { code: "EGP", symbol: "ج.م", name: "Egyptian Pound" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  ],

  userMenuItems: [
    { icon: Home, label: "Home", href: "" },
    { icon: ShoppingCart, label: "Cart", href: "/cart" },
    { icon: Heart, label: "Wishlist", href: "/wishlist" },
    { icon: Package, label: "Orders", href: "/dashboard/orders" },
    { icon: Ticket, label: "My Coupons", href: "coupons" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: LifeBuoy, label: "Help & Support", href: "/support" },
    { icon: Book, label: "Documentation", href: "docs" },
  ],

  guestMenuItems: [
    { icon: Home, label: "Home", href: "/" },
    { icon: LifeBuoy, label: "Help & Support", href: "/support" },
    { icon: Book, label: "Documentation", href: "/docs" },
  ],

  quickLinks: [
    { label: "home", href: "/" },
    { label: "products", href: "store" },
    { label: "about", href: "about" },
    { label: "contact", href: "contact" },
  ],

  supportLinks: [
    {
      label: "shipping",
      href: "/shipping",
    },
    {
      label: "returns",
      href: "/returns",
    },
    {
      label: "faq",
      href: "/faq",
    },
    {
      label: "privacy",
      href: "/privacy",
    },
  ],
}
