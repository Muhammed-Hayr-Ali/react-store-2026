/**
 * @file components/shared/products-view/product-grid.tsx
 * @description Flexible and generic product grid component with built-in next-intl translations and dummy time delay for infinite scroll testing.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  AlertTriangleIcon,
  HomeIcon,
  Loader2,
  PackageOpenIcon,
  RotateCcwIcon,
} from "lucide-react"

import ViewMode from "@/components/shared/view_mode"
import {
  ProductCard,
  SimpliProduct,
} from "@/components/store/product-grid/product-card"
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
  name?: string
  description?: string

  hasError?: boolean
  initialProducts: SimpliProduct[] | []
  viewMode: "grid" | "list"
  onRetry?: () => void
  showHeartButton?: boolean
  showCartButton?: boolean
  className?: string

  onLoadMore?: () => Promise<void> | void
  hasMore?: boolean
  isLoadingMore?: boolean

  hasAction?: boolean
}

export function ProductGrid({
  name,
  description,
  hasError = false,
  initialProducts,
  viewMode: initialViewMode,
  onRetry,
  showHeartButton,
  showCartButton,
  className,
  onLoadMore,
  hasMore,
  isLoadingMore,
  hasAction = true,
}: ProductGridProps) {
  const t = useTranslations("ProductsView.List")

  // View Mode
  const [mode, setMode] = React.useState<"grid" | "list">(initialViewMode)

  const loadMoreRef = React.useRef<HTMLDivElement>(null)

  // مراقبة السكرول لتشغيل دالة التحميل القادمة من الأب
  React.useEffect(() => {
    const currentRef = loadMoreRef.current
    if (!currentRef || !onLoadMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) observer.unobserve(currentRef)
    }
  }, [onLoadMore, isLoadingMore, hasMore])

  // Error Component
  if (hasError) return <ErrorList onRetry={onRetry} hasAction={hasAction} className={className}/>

  // Empty Component
  if (initialProducts.length === 0) return <EmptyList hasAction={hasAction}  className={className}/>

  // List Component
  return (
    <section className={cn("space-y-6", className)}>
      {/* Header & Toolbar Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {name}
        </h2>
        <ViewMode initValue={mode} onChange={setMode} />
      </div>
      <p>{description}</p>
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

      {onLoadMore && (
        <div ref={loadMoreRef} className="flex min-h-12.5 justify-center py-8">
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span>{t("LOADING")}</span>
            </div>
          )}
          {!hasMore && initialProducts.length > 0 && (
            <p className="text-xs text-muted-foreground">{t("END")}</p>
          )}
        </div>
      )}
    </section>
  )
}

interface ListProps {
  onRetry?: () => void
  hasAction?: boolean
  className?: string
}

function EmptyList({ hasAction = true, className }: ListProps) {
  const t = useTranslations("ProductsView.Empty")

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center",
        className
      )}
    >
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
        {hasAction && (
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
        )}
      </Empty>
    </div>
  )
}

function ErrorList({ onRetry, hasAction = true, className }: ListProps) {
  const t = useTranslations("ProductsView.Error")

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center",
        className
      )}
    >
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

        {hasAction && (
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
        )}
      </Empty>
    </div>
  )
}
