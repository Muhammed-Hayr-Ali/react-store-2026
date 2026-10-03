import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
} from "@/components/shared/icons"

export const footerConfig = {
  quickLinks: {
    title: "Quick Links",
    items: [
      { label: "Home", href: "/" },
      { label: "Store", href: "/" },
      { label: "Products", href: "/products" },
      { label: "About", href: "/about" },
    ],
  },
  supportLinks: {
    title: "Support",
    items: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Terms & Privacy", href: "/terms-and-privacy" },
    ],
  },
  socialLinks: [
    {
      label: "X (Twitter)",
      href: "https://x.com/marketna",
      icon: TwitterIcon,
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/marketna",
      icon: FacebookIcon,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/marketna",
      icon: InstagramIcon,
    },
  ],
} as const
