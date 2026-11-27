"use client"

/**
 * @file components/store/footer.tsx
 * @description Footer component with integrated next-intl translation support.
 */

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AppLogo } from "@/components/shared/app-logo"
import { APP_CONFIG, STORE_CONTAINER } from "@/lib/config/app_config"

import { footerConfig } from "./footer-config"
import { ThemeToggle } from "./theme-toggle"
import { NewsletterSection } from "./newsletter-section"

export function StoreFooter() {
  const t = useTranslations("Footer")

  const linkSections = [
    footerConfig.quickLinks,
    footerConfig.supportLinks,
  ] as const

  return (
    <footer className="w-full shrink-0 border-t border-border/40 bg-background pt-8 pb-2 text-sm text-muted-foreground md:block">
      <div className={STORE_CONTAINER}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. قسم العلامة التجارية والوصف */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <AppLogo size="md" />
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground/90">
              {t("app_description")}
            </p>

            {/* قنوات التواصل الاجتماعي */}
            <div className="flex flex-wrap items-center gap-2">
              {footerConfig.socialLinks.map((item) => {
                const label = t(item.label)

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

          {/* 2 و 3. القوائم كـ Accordion فلات وممتد على الجوال */}
          <Accordion
            type="multiple"
            className="w-full space-y-1 !border-0 !bg-transparent p-0 shadow-none sm:hidden"
          >
            {linkSections.map((section) => (
              <AccordionItem
                key={section.key}
                value={section.key}
                className="!border-0 !bg-transparent p-0"
              >
                <AccordionTrigger className="w-full rounded-none !bg-transparent px-0 py-2.5 text-sm font-semibold tracking-tight text-foreground shadow-none hover:!bg-transparent hover:no-underline data-[state=open]:!bg-transparent">
                  {t(`${section.key}`)}
                </AccordionTrigger>
                <AccordionContent className="!bg-transparent px-0 pt-1 pb-3 [&>div]:!bg-transparent [&>div]:p-0">
                  <FooterLinksList items={section.items} t={t} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* 2 و 3. القوائم المفتوحة على الشاشات الأكبر من الجوال */}
          {linkSections.map((section) => (
            <FooterSection
              key={section.key}
              title={t(`${section.key}`)}
              className="hidden sm:flex"
            >
              <FooterLinksList items={section.items} t={t} />
            </FooterSection>
          ))}

          {/* 4. النشرة البريدية */}
          <NewsletterSection />
        </div>

        {/* الجزء السفلي للحقوق والمظهر */}
        <div className="mt-10 border-t border-border/50 pt-6">
          <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {APP_CONFIG.NAME}.{" "}
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

function FooterLinksList({
  items,
  t,
}: {
  items: readonly { key: string; label: string; href: string }[]
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => {
        const label = t(item.label)

        return (
          <li key={item.key}>
            <Link
              href={item.href}
              className="text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:underline focus-visible:outline-none"
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function FooterSection({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      <h4 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h4>
      {children}
    </div>
  )
}