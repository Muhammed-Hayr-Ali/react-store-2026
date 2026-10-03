"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CustomInput } from "@/components/ui/custom-input"
import { AppLogo } from "@/components/ui/app-logo"
import { appConfig } from "@/lib/config/app_config"

import { footerConfig } from "./footer-config"
import { ThemeToggle } from "./theme-toggle"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-background text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* شبكة محتويات الفوتر */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. قسم العلامة التجارية والوصف */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <AppLogo size="md" />
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground/90">
              {appConfig.description}
            </p>

            {/* قنوات التواصل الاجتماعي */}
            <div className="flex flex-wrap items-center gap-2">
              {footerConfig.socialLinks.map((item) => (
                <Button
                  key={item.label}
                  variant="secondary"
                  size="icon"
                  className="size-8 rounded-lg text-muted-foreground shadow-none hover:text-foreground"
                  asChild
                >
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                  >
                    <item.icon className="size-4" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* 2. الروابط السريعة */}
          <FooterSection title={footerConfig.quickLinks.title}>
            <ul className="flex flex-col gap-2.5">
              {footerConfig.quickLinks.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:underline focus-visible:outline-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* 3. روابط الدعم والمساعدة */}
          <FooterSection title={footerConfig.supportLinks.title}>
            <ul className="flex flex-col gap-2.5">
              {footerConfig.supportLinks.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:underline focus-visible:outline-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* 4. النشرة البريدية */}
          <NewsletterSection />
        </div>

        {/* الجزء السفلي للحقوق والمظهر */}
        <div className="mt-10 border-t border-border/50 pt-6">
          <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {appConfig.name}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h4>
      {children}
    </div>
  )
}

function NewsletterSection() {
  const [email, setEmail] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success("Thanks for subscribing! 🎉")
      setEmail("")
    } catch {
      toast.error("Failed to subscribe. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold tracking-tight text-foreground">
          Subscribe to our newsletter
        </h4>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Stay updated on new releases, features, and guides.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pt-1">
        <div className="relative flex-1">
          <CustomInput
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isSubmitting}
            required
            className="h-9 rounded-lg border border-border/60 bg-muted/30 px-3 text-xs shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="icon"
          disabled={isSubmitting}
          className="size-9 shrink-0 cursor-pointer rounded-lg shadow-none"
          aria-label="Subscribe to newsletter"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Send className="size-4 text-foreground" />
          )}
          <span className="sr-only">Subscribe</span>
        </Button>
      </form>
    </div>
  )
}
