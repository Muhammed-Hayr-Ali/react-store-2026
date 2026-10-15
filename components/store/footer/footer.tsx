"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/ui/app-logo"
import { appConfig } from "@/lib/config/app_config"

import { footerConfig } from "./footer-config"
import { ThemeToggle } from "./theme-toggle"
import { NewsletterSection } from "./newsletter-section"

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

          {/* 3. روابط الدعم والمساعدة مع زر الإبلاغ عن مشكلة فنية */}
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
