"use client"

/**
 * @file components/store/footer.tsx
 * @description Footer component with integrated next-intl translation support.
 */

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/ui/app-logo"
import { appConfig } from "@/lib/config/app_config"

import { footerConfig } from "./footer-config"
import { ThemeToggle } from "./theme-toggle"
import { NewsletterSection } from "./newsletter-section"

export default function Footer() {
  const t = useTranslations("Footer")

  return (
    <footer className="w-full border-t border-border/40 bg-background text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. قسم العلامة التجارية والوصف */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <AppLogo size="md" />
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground/90">
              {t(footerConfig.description)}
            </p>

            {/* قنوات التواصل الاجتماعي */}
            <div className="flex flex-wrap items-center gap-2">
              {footerConfig.socialLinks.map((item) => {
                const label = t(`social.${item.key}`)
                return (
                  <Button
                    key={item.key}
                    variant="secondary"
                    size="icon"
                    asChild
                  >
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                    >
                      <item.icon className="size-4" />
                      <span className="sr-only">{label}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* 2. الروابط السريعة */}
          <FooterSection title={t(`sections.${footerConfig.quickLinks.key}`)}>
            <ul className="flex flex-col gap-2.5">
              {footerConfig.quickLinks.items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:underline focus-visible:outline-none"
                  >
                    {t(`links.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* 3. روابط الدعم والمساعدة */}
          <FooterSection title={t(`sections.${footerConfig.supportLinks.key}`)}>
            <ul className="flex flex-col gap-2.5">
              {footerConfig.supportLinks.items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:underline focus-visible:outline-none"
                  >
                    {t(`links.${item.key}`)}
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
              &copy; {new Date().getFullYear()} {appConfig.name}.{" "}
              {t("rights_reserved")}
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
