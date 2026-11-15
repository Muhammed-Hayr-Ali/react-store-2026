"use client"

/**
 * @file components/store/wishlist/empty-wishlist.tsx
 * @description Empty state component for the wishlist page using custom Empty primitive components.
 */

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { HeartOffIcon, ShoppingBagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function EmptyWishlist() {
  const locale = useLocale()
  const t = useTranslations("Wishlist.Empty")

  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-12">
      <Empty className="border border-dashed p-8 rounded-2xl max-w-md w-full text-center">
        <EmptyHeader className="flex flex-col items-center">
          <EmptyMedia variant="icon" className="size-16 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mb-4">
            <HeartOffIcon className="size-8 stroke-[1.5]" />
          </EmptyMedia>
          <EmptyTitle className="text-lg font-semibold tracking-tight text-foreground">
            {t("title", { default: "Your wishlist is empty" })}
          </EmptyTitle>
          <EmptyDescription className="text-sm text-muted-foreground mt-1.5 max-w-xs">
            {t("description", {
              default: "Save your favorite products to easily find them later and track their availability.",
            })}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-6 flex justify-center">
          <Button asChild variant="default" size="sm" className="gap-2 rounded-xl font-medium">
            <Link href={`/${locale}/products`}>
              <ShoppingBagIcon className="size-4" />
              <span>{t("action", { default: "Explore Products" })}</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}