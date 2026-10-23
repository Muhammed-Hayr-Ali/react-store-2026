/**
 * @file app/[locale]/(store)/wishlist/page.tsx
 * @description User wishlist page displaying saved products with translations and strict error handling.
 */

import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { HeartCrackIcon, ShoppingBagIcon, HeartIcon } from "lucide-react"

import { getWishlist } from "@/lib/actions/wishlists"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { ProductsGrid } from "@/components/store/wishlist/products-grid"
import { Button } from "@/components/ui/button"
import type { AppLocale } from "@/i18n/routing"

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Wishlist" })
  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  const typedLocale = locale as AppLocale
  const t = await getTranslations({ locale, namespace: "Wishlist" })
  const errors = await getTranslations({ locale, namespace: "ActionErrors" })

  const result = await getWishlist()

  if (!result.success) {
    throw new Error(
      errors(getActionErrorKey(result.error ?? "UNEXPECTED_ERROR"))
    )
  }

  const wishlistItems = result.data

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <header className="flex items-center gap-2 border-b border-border/40 pb-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <HeartIcon className="size-4" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("PAGE_TITLE")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("PAGE_DESCRIPTION")} ({t("ITEMS_COUNT", { count: wishlistItems.length })})
          </p>
        </div>
      </header>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 py-16 px-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4 text-muted-foreground">
            <HeartCrackIcon className="size-8" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {t("EMPTY_TITLE")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {t("EMPTY_DESCRIPTION")}
          </p>
          <Button asChild className="rounded-2xl gap-2">
            <Link href={`/${typedLocale}`}>
              <ShoppingBagIcon className="size-4" />
              {t("BROWSE_PRODUCTS")}
            </Link>
          </Button>
        </div>
      ) : (
        <ProductsGrid items={wishlistItems} locale={typedLocale} />
      )}
    </main>
  )
}