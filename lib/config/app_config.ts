export const APP_NAME = "Marketna"

export const APP_CONFIG = {
  NAME: APP_NAME,
  DESCIRIPTION: `Marketna: Your smart destination for everyday essentials where quality, variety, and speed come together.`,
  URL: "https://marketna.vercel.app",
  ROBOTS: "index, follow",
  KEYWORDS: [
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
  LOCALE: "en_US",
  TWITTER_HANDLE: "@marketna",
  ICONS: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

}

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
