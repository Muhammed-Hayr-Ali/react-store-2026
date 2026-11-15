/**
 * @file components/shared/products-view/product-grid.tsx
 * @description Flexible and generic product grid component with built-in next-intl translations.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  AlertTriangleIcon,
  HeartOffIcon,
  HomeIcon,
  PackageOpen,
  PackageOpenIcon,
  RotateCcwIcon,
} from "lucide-react"

import ViewMode from "@/components/shared/view_mode"
import {
  ProductCard,
  SimpliProduct,
} from "@/components/shared/products-view/product-card"
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
import { cn } from "@/lib/utils"

export interface ProductGridProps {
  title: string
  hasError?: boolean
  initialProducts: SimpliProduct[] | []
  viewMode: "grid" | "list"
  onRetry?: () => void
  showHeartButton?: boolean
  showCartButton?: boolean
  className?: string
}

export function ProductGrid({
  title,
  hasError = false,
  initialProducts,
  viewMode: initialViewMode,
  onRetry,
  showHeartButton,
  showCartButton,
  className,
}: ProductGridProps) {
  const [mode, setMode] = React.useState<"grid" | "list">(initialViewMode)

  if (hasError) return <ErrorList onRetry={onRetry} />

  if (initialProducts.length === 0) return <EmptyList />

  return (
    <section className={cn("space-y-6", className)}>
      {/* Header & Toolbar Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>

        <ViewMode initValue={mode} onChange={setMode} />
      </div>

      <div
        className={cn(
          mode === "grid"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2"
        )}
      >
        {initialProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={mode}
            showCartButton={showCartButton}
            showHeartButton={showHeartButton}
          />
        ))}
      </div>
    </section>
  )
}

function EmptyList() {
  const t = useTranslations("ProductsView.Empty")

  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-12">
      <Empty className="w-full max-w-md rounded-2xl border border-dashed p-8 text-center">
        <EmptyHeader className="flex flex-col items-center">
          <EmptyMedia
            variant="icon"
            className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
          >
            <PackageOpenIcon className="size-8 stroke-[1.5]" />
          </EmptyMedia>
          <EmptyTitle className="text-lg font-semibold tracking-tight text-foreground">
            {t("title")}
          </EmptyTitle>
          <EmptyDescription className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            {t("description")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-6 flex justify-center">
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-1/2 gap-2 font-medium"
          >
            <Link href={APP_ROUTES.HOME}>
              <HomeIcon className="size-4" />
              <span>{t("home")}</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

interface ErrorListProps {
  onRetry?: () => void
}

function ErrorList({ onRetry }: ErrorListProps) {
  const t = useTranslations("ProductsView.Error")

  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center px-4 py-12">
      <Empty className="w-full max-w-lg rounded-3xl border border-dashed p-8 text-center shadow-sm">
        <EmptyHeader className="flex flex-col items-center">
          <EmptyMedia
            variant="icon"
            className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          >
            <AlertTriangleIcon className="size-8 stroke-[1.5]" />
          </EmptyMedia>

          <EmptyTitle className="text-xl font-bold tracking-tight text-foreground">
            {t("title")}
          </EmptyTitle>

          <EmptyDescription className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("description")}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            variant="default"
            asChild={!onRetry}
            onClick={onRetry || (() => window.location.reload())}
            className="w-full gap-2 font-medium sm:w-auto"
          >
            {onRetry ? (
              <>
                <RotateCcwIcon className="size-4" />
                <span>{t("retry")}</span>
              </>
            ) : (
              <Link href={APP_ROUTES.HOME}>
                <RotateCcwIcon className="size-4" />
                <span>{t("retry")}</span>
              </Link>
            )}
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full gap-2 font-medium sm:w-auto"
          >
            <Link href={APP_ROUTES.HOME}>
              <HomeIcon className="size-4" />
              <span>{t("home")}</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
