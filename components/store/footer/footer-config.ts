/**
 * @file components/store/footer-config.ts
 * @description Configuration for footer links and social media channels with translation keys.
 */

import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from "@/components/shared/icons"

export const footerConfig = {
  description: "app_description",

  quickLinks: {
    key: "quick_links",
    items: [
      { key: "home", href: "/" },
      { key: "store", href: "/" },
      { key: "products", href: "/products" },
      { key: "about", href: "/about" },
    ],
  },
  supportLinks: {
    key: "support",
    items: [
      { key: "contact", href: "/contact" },
      { key: "faq", href: "/faq" },
      { key: "shipping", href: "/shipping" },
      { key: "returns", href: "/returns" },
      { key: "terms_and_privacy", href: "/terms-and-privacy" },
    ],
  },
  socialLinks: [
    {
      key: "twitter",
      href: "https://x.com/marketna",
      icon: TwitterIcon,
    },
    {
      key: "facebook",
      href: "https://www.facebook.com/marketna",
      icon: FacebookIcon,
    },
    {
      key: "instagram",
      href: "https://www.instagram.com/marketna",
      icon: InstagramIcon,
    },
  ],
} as const
