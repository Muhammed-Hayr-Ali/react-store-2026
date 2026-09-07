"use client"

import { CustomButton } from "@/components/ui/custom-button"
import Link from "next/link"

import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { AppLogo } from "@/components/ui/app-logo"
import { appConfig } from "@/lib/config/app_config"
import { ThemeToggle } from "@/components/layout/footer/theme-toggle"
import { toast } from "sonner"
import { CustomInput } from "@/components/ui/custom-input"
/**
 * 🦶 Footer Component
 * يعرض معلومات الموقع، روابط سريعة، ونشرة بريدية
 */
const Footer = () => {
  return (
    <footer className="w-full border-t bg-background text-sm text-muted-foreground">
      <div className="mx-auto max-w-262.5 px-4 py-8 sm:px-6 lg:px-8">
        {/* ===== Main Footer Grid ===== */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* ===== Brand Section ===== */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <AppLogo size="md" />
            <p className="text-xs leading-relaxed">{appConfig.description}</p>

            {/* Social Links */}
            <div className="flex gap-3">
              {appConfig.menu.socialMediaLinks.items.map((item) => (
                <CustomButton
                  key={item.key}
                  variant="secondary"
                  size="icon-lg"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                  </Link>
                </CustomButton>
              ))}
            </div>
          </div>

          {/* ===== Quick Links ===== */}
          <FooterSection title={appConfig.menu.quickLinks.name}>
            <ul className="flex flex-col gap-2">
              {appConfig.menu.quickLinks.items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* ===== Support Links ===== */}
          <FooterSection title={appConfig.menu.supportLinks.name}>
            <ul className="flex flex-col gap-2">
              {appConfig.menu.supportLinks.items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* ===== Newsletter ===== */}
          <NewsletterSection />
        </div>

        {/* ===== Footer Bottom ===== */}
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs">
              &copy; {new Date().getFullYear()} {appConfig.name}. All rights
              reserved.
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

// =====================================================
// Helper Components
// =====================================================

function FooterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {children}
    </div>
  )
}


function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      toast.success("Thanks for subscribing! 🎉")
      setEmail("")
    } catch {
      toast.error("Failed to subscribe. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:col-span-1">
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-foreground">
          Subscribe to our newsletter
        </h4>
        <p className="text-xs leading-relaxed">
          Stay updated on new releases, features, and guides.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-1">
        <CustomInput
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={isSubmitting}
          required
          className="h-8 border-0 bg-secondary focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-secondary"
        />
        <CustomButton
          size="icon-lg"
          type="submit"
          variant="secondary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        </CustomButton>
      </form>
    </div>
  )
}
