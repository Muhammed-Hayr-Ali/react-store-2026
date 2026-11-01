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
      { key: "home",  label: "home",       href: "/" },
      { key: "store", label: "store",      href: "/" },
      { key: "products", label: "products", href: "/products" },
      { key: "about", label: "about",      href: "/about" },
    ],
  },
  supportLinks: {
    key: "support",
    items: [
      { key: "contact", label: "contact", href: "/contact" },
      { key: "faq", label: "faq", href: "/faq" },
      { key: "shipping", label: "shipping", href: "/shipping" },
      { key: "returns", label: "returns", href: "/returns" },
      { key: "terms_and_privacy", label: "terms_and_privacy", href: "/terms-and-privacy" },
    ],
  },
  socialLinks: [
    {
      key: "twitter",
      label: "twitter",
      href: "https://x.com/marketna",
      icon: TwitterIcon,
    },
    {
      key: "facebook",
      label: "facebook",
      href: "https://www.facebook.com/marketna",
      icon: FacebookIcon,
    },
    {
      key: "instagram",
      label: "instagram",
      href: "https://www.instagram.com/marketna",
      icon: InstagramIcon,
    },
  ],
} as const
