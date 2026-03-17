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

  targetCurrencies: ["SAR", "EGP", "TRY", "EUR", "AED"],

  supportedCurrencies: [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "SYP", symbol: "ل.س", name: "Syrian Lira" },
    { code: "SAR", symbol: "ر.س", name: "Saudi Riyal" },
    { code: "EGP", symbol: "ج.م", name: "Egyptian Pound" },
    { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  ]
}