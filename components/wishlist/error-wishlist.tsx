"use client"

/**
 * @file components/store/wishlist/error-wishlist.tsx
* @description Global error boundary page for handling runtime errors with retry and home redirection options. */

import { useTranslations } from "next-intl"
import { AlertTriangleIcon, HomeIcon, RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { APP_ROUTES } from "@/lib/config/app-routes"
import Link from "next/link"

export default function ErrorWishlist() {
  const t = useTranslations("Wishlist.Error")

return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center px-4 py-12">
      <Empty className="border border-dashed p-8 rounded-3xl max-w-lg w-full text-center shadow-sm">
        <EmptyHeader className="flex flex-col items-center">
          <EmptyMedia
            variant="icon"
            className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4"
          >
            <AlertTriangleIcon className="size-8 stroke-[1.5]" />
          </EmptyMedia>

          <EmptyTitle className="text-xl font-bold tracking-tight text-foreground">
            {t("title")}
          </EmptyTitle>

          <EmptyDescription className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
            {t("description", )}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* زر إعادة المحاولة */}
          <Button variant="default" asChild className="gap-2 font-medium min-w-1/2">
            <Link href={APP_ROUTES.CATEGORIES}>
            <RotateCcwIcon className="size-4" />
            <span>{t("retry")}</span>
            </Link>
          </Button>

          {/* زر العودة للرئيسية */}
          <Button variant="outline" asChild className="gap-2 font-medium min-w-1/2">
            <Link href={APP_ROUTES.HOME}>
              <HomeIcon className="size-4" />
              <span>{t("home")}</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )}
