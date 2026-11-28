/**
 * @file components/store/product-details/details/product-actions.tsx
 * @description Apple-inspired minimalist product action bar with quantity selection, add-to-cart, and wishlist toggle.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  LoaderCircleIcon,
  HeartIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductVariantDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { useCurrency } from "@/lib/context/currency-context"
import { useCart } from "@/lib/context/cart-context"
import { useWishlist } from "@/lib/context/wishlist-context"
import { cn } from "@/lib/utils"
import { isVariantOutOfStock } from "./variant-utils"

interface ProductActionsProps {
  productId: string
  variant: ProductVariantDetail
  isProductActive: boolean
}

export function ProductActions({
  productId,
  variant,
  isProductActive,
}: ProductActionsProps) {
  const t = useTranslations("ProductDetails")
  const { formatRawPrice, currentCurrency } = useCurrency()
  const { addItem, isPending } = useCart()
  const { isInWishlist, toggleWishlist, isWishlistPending } = useWishlist()

  const [quantity, setQuantity] = React.useState(1)

  // الشريط "طافٍ" ما دام مكانه الأصلي أسفل حافة الشاشة
  const barRef = React.useRef<HTMLDivElement>(null)
  const [isFloating, setIsFloating] = React.useState(false)

  React.useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    // 13px = مسافة bottom-3 (12px) + بكسل واحد لاكتشاف الالتصاق
    const observer = new IntersectionObserver(
      ([entry]) => {
        const rootBottom = entry.rootBounds?.bottom ?? window.innerHeight
        setIsFloating(
          entry.intersectionRatio < 1 &&
            entry.boundingClientRect.bottom > rootBottom
        )
      },
      { rootMargin: "0px 0px -13px 0px", threshold: [0, 1] }
    )

    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  const [prevVariantId, setPrevVariantId] = React.useState(variant.id)
  if (prevVariantId !== variant.id) {
    setPrevVariantId(variant.id)
    setQuantity(1)
  }

  const isOutOfStock = isVariantOutOfStock(variant)
  const isDisabled = !isProductActive || isOutOfStock || isPending
  const maxQuantity = variant.track_inventory
    ? variant.stock_quantity
    : Number.POSITIVE_INFINITY

  // تقييد الكمية في حال انخفض المخزون بعد اختيارها
  const safeQuantity = isOutOfStock ? 0 : Math.min(quantity, maxQuantity)
  // الأسعار مخزنة بالسنتات
  const totalPriceInCents = variant.price * safeQuantity

  const wishlisted = isInWishlist(productId)
  const wishlistBusy = isWishlistPending(productId)

  const handleAddToCart = async () => {
    if (isDisabled) return
    await addItem({
      product_id: productId,
      variant_id: variant.id,
      quantity: safeQuantity,
    })
  }

  const handleToggleWishlist = async () => {
    await toggleWishlist(productId)
  }

  const buttonLabel = !isProductActive
    ? t("UNAVAILABLE_PRODUCT")
    : isOutOfStock
      ? t("OUT_OF_STOCK_BUTTON")
      : isPending
        ? t("ADDING_TO_CART")
        : t("ADD_TO_CART")

  const wishlistLabel = wishlisted
    ? t("REMOVE_FROM_WISHLIST", { default: "إزالة من المفضلة" })
    : t("ADD_TO_WISHLIST", { default: "إضافة إلى المفضلة" })

  // أنماط الحالة الطافية تطبق على الموبايل فقط (max-md)
  return (
    // ارتفاع الحاوية ثابت في الحالتين، فلا تقفز الصفحة ولا يومض الشريط
    <div
      ref={barRef}
      className="pointer-events-none sticky bottom-3 z-30 flex h-14 items-center justify-center md:static"
    >
      <div
        data-floating={isFloating}
        className={cn(
          "pointer-events-auto flex w-full max-w-full items-center gap-2 border border-transparent transition-all duration-300 ease-out motion-reduce:transition-none",
          isFloating &&
            "max-md:max-w-76 max-md:gap-0 max-md:rounded-xl max-md:border-border/60 max-md:bg-background/95 max-md:p-1 max-md:shadow-[0_8px_24px_rgb(0_0_0/0.10)] max-md:backdrop-blur-xl"
        )}
      >
        <Button
          type="button"
          size="lg"
          className={cn(
            "h-12 min-w-0 flex-1 justify-between gap-2 rounded-lg px-4 text-sm font-semibold active:scale-[0.99]",
            isFloating &&
              "max-md:h-10 max-md:justify-center max-md:bg-transparent max-md:px-2 max-md:font-medium max-md:text-foreground max-md:hover:bg-muted"
          )}
          disabled={isDisabled}
          aria-busy={isPending}
          onClick={handleAddToCart}
        >
          <span className="flex min-w-0 items-center gap-2">
            {isPending ? (
              <LoaderCircleIcon className="size-4 shrink-0 animate-spin" />
            ) : (
              <ShoppingBagIcon className="size-4 shrink-0" />
            )}
            <span className="truncate">{buttonLabel}</span>
          </span>
          {!isDisabled && (
            <span
              className={cn(
                "shrink-0 tabular-nums",
                isFloating && "max-md:hidden"
              )}
            >
              {formatRawPrice(totalPriceInCents)} {currentCurrency.symbol}
            </span>
          )}
        </Button>

        <div
          className={cn(
            "flex h-12 shrink-0 items-center rounded-lg bg-muted px-1",
            isFloating &&
              "max-md:h-7 max-md:rounded-none max-md:border-s max-md:border-border max-md:bg-transparent max-md:ps-1 max-md:pe-0"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuantity(Math.max(1, safeQuantity - 1))}
            disabled={isDisabled || safeQuantity <= 1}
            className={cn("size-9 rounded-md", isFloating && "max-md:size-8")}
            aria-label={t("DECREASE_QUANTITY")}
          >
            <MinusIcon className="size-3.5" />
          </Button>
          <span
            aria-live="polite"
            aria-label={`${t("QUANTITY")}: ${safeQuantity}`}
            className={cn(
              "w-7 text-center text-sm font-semibold tabular-nums",
              isFloating && "max-md:w-5"
            )}
          >
            {safeQuantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuantity(Math.min(maxQuantity, safeQuantity + 1))}
            disabled={isDisabled || safeQuantity >= maxQuantity}
            className={cn("size-9 rounded-md", isFloating && "max-md:size-8")}
            aria-label={t("INCREASE_QUANTITY")}
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-pressed={wishlisted}
          aria-busy={wishlistBusy}
          aria-label={wishlistLabel}
          disabled={wishlistBusy}
          onClick={handleToggleWishlist}
          className={cn(
            "size-12 shrink-0 rounded-lg bg-muted text-foreground transition-colors hover:bg-muted/80 active:scale-[0.98]",
            wishlisted && "text-destructive hover:text-destructive",
            isFloating &&
              "max-md:ms-1 max-md:size-9 max-md:bg-transparent max-md:hover:bg-transparent"
          )}
        >
          <HeartIcon
            aria-hidden="true"
            className={cn(
              "size-5 transition-transform duration-200",
              wishlisted && "scale-105 fill-current"
            )}
          />
        </Button>
      </div>
    </div>
  )
}
