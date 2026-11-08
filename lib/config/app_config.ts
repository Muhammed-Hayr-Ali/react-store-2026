export const APP_NAME = "Marketna"

export const APP_CONFIG = {
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

} as const

export const COOKIES_KEYS = {
  LOGIN_METHOD: "login_method",
  CURRENCY: "app_currency",
  PRODUCT_MODE: "store_product_view_mode",
} as const


export const PRODUCT_MODE = {
  GRID: "grid",
  LIST: "list",
} as const


export const LOGIN_METHODS = {
  EMAIL: "email",
  GOOGLE: "google",
  PHONE: "phone",
} as const
