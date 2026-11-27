"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Link, usePathname } from "@/i18n/navigation"
import { APP_ROUTES } from "@/lib/config/app-routes"
import { useCart } from "@/lib/context/cart-context"
import { useCurrency } from "@/lib/context/currency-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTrigger,
} from "@/components/shared/bottom-sheet"
import {
  focusRing,
  headerActionClass,
  isRtlLocale,
} from "./store-header-shared"

interface CartButtonProps {
  variant?: "header" | "sticky"
  className?: string
}

/** شارة عدد السلة: تختفي عند الصفر وتُختصر فوق 99 */
function CartBadge({ count, className }: { count: number; className: string }) {
  if (count <= 0) return null
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-normal text-primary-foreground",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function CartButton({ variant = "header", className }: CartButtonProps) {
  const t = useTranslations("StoreHeader")
  const tCart = useTranslations("Cart")
  const locale = useLocale()
  const isRtl = isRtlLocale(locale)
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const [open, setOpen] = React.useState(false)
  const { cart, totalItemsCount, updateItemQuantity, removeItem, isPending } =
    useCart()
  const { formatPrice } = useCurrency()

  // إذا كان المستخدم في صفحة السلة أو إتمام الطلب، نبقيه رابطاً مباشراً دون فتح BottomSheet
  const isCartOrCheckoutPage =
    pathname === APP_ROUTES.CART ||
    pathname.startsWith(`${APP_ROUTES.CART}/`) ||
    pathname.startsWith("/checkout")

  const useBottomSheet = isMobile && !isCartOrCheckoutPage

  const cartLabel =
    totalItemsCount > 0
      ? `${t("cartAriaLabel")} (${totalItemsCount})`
      : t("cartAriaLabel")

  const items = cart?.items ?? []
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  // حساب الإجمالي الفرعي بالسنتات لتمريره إلى formatPrice
  const subtotalInCents = React.useMemo(
    () =>
      items.reduce((acc, item) => {
        const unitPriceInCents = Math.round(
          Number(item.product_variants?.price ?? 0) * 100
        )
        return acc + unitPriceInCents * Number(item.quantity)
      }, 0),
    [items]
  )

  const buttonContent =
    variant === "sticky" ? (
      <>
        <ShoppingBag aria-hidden="true" className="size-5" />
        <CartBadge count={totalItemsCount} className="inset-e-1 top-1" />
      </>
    ) : (
      <>
        <span className="relative">
          <ShoppingBag aria-hidden="true" className="size-5 lg:size-4" />
          <CartBadge count={totalItemsCount} className="-inset-e-2 -top-1.5" />
        </span>
        <span className="hidden lg:inline">{t("cart")}</span>
      </>
    )

  const triggerClassName =
    variant === "sticky"
      ? cn(
          "relative -me-2.5 flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted/60 hover:text-primary",
          focusRing,
          className
        )
      : cn(headerActionClass, className)

  // على الشاشات الأكبر من الجوال أو داخل صفحة السلة: رابط مباشر
  if (!useBottomSheet) {
    return (
      <Link
        href={APP_ROUTES.CART}
        aria-label={cartLabel}
        className={triggerClassName}
      >
        {buttonContent}
      </Link>
    )
  }

  return (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <BottomSheetTrigger asChild>
        <button
          type="button"
          aria-label={cartLabel}
          className={triggerClassName}
        >
          {buttonContent}
        </button>
      </BottomSheetTrigger>

      <BottomSheetContent ariaLabel={cartLabel}>
        <BottomSheetHeader>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-foreground">
              {t("cart")}
            </span>
            {totalItemsCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {totalItemsCount}
              </span>
            )}
          </div>
        </BottomSheetHeader>

        <BottomSheetBody className="px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <ShoppingBag
                aria-hidden="true"
                className="size-8 text-muted-foreground/50"
              />
              <p className="text-sm text-muted-foreground">
                {tCart("EMPTY_CART", { default: "سلة التسوق فارغة" })}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((item) => {
                const qty = Number(item.quantity)
                const product = item.products
                const variantInfo = item.product_variants
                const imageUrl =
                  item.resolved_image_url ??
                  product.product_images.find((img) => img.is_primary)?.url ??
                  product.product_images[0]?.url ??
                  null

                const maxStock =
                  variantInfo?.track_inventory &&
                  typeof variantInfo.stock_quantity === "number"
                    ? variantInfo.stock_quantity
                    : Infinity
                const canIncrease = !isPending && qty < maxStock

                const unitPriceInCents = Math.round(
                  Number(variantInfo?.price ?? 0) * 100
                )

                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    {/* صورة المنتج */}
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/40"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ShoppingBag
                          aria-hidden="true"
                          className="size-4 text-muted-foreground/50"
                        />
                      )}
                    </Link>

                    {/* اسم المنتج، SKU، والسعر بالعملة المختارة */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={() => setOpen(false)}
                        className="block truncate text-sm text-foreground transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        {unitPriceInCents > 0 && (
                          <bdi className="font-mono text-foreground/85 tabular-nums">
                            {formatPrice(unitPriceInCents)}
                          </bdi>
                        )}
                        {variantInfo?.sku && (
                          <span className="truncate font-mono text-[11px] text-muted-foreground/80">
                            {variantInfo.sku}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* التحكم بالكمية */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isPending}
                        aria-label={tCart("DECREASE_QUANTITY", {
                          default: "إنقاص الكمية",
                        })}
                        onClick={() =>
                          qty <= 1
                            ? removeItem(item.id)
                            : updateItemQuantity(item.id, qty - 1)
                        }
                        className="flex size-7 items-center justify-center rounded-lg border border-border/60 text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                      >
                        {qty <= 1 ? (
                          <Trash2 className="size-3.5 text-destructive" />
                        ) : (
                          <Minus className="size-3.5" />
                        )}
                      </button>

                      <span className="w-6 text-center text-xs tabular-nums">
                        {qty}
                      </span>

                      <button
                        type="button"
                        disabled={!canIncrease}
                        aria-label={tCart("INCREASE_QUANTITY", {
                          default: "زيادة الكمية",
                        })}
                        onClick={() => updateItemQuantity(item.id, qty + 1)}
                        className="flex size-7 items-center justify-center rounded-lg border border-border/60 text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </BottomSheetBody>

        <BottomSheetFooter className="flex flex-col gap-2.5">
          {items.length > 0 && subtotalInCents > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{tCart("SUBTOTAL", { default: "الإجمالي الفرعي" })}</span>
              <bdi className="font-mono text-sm font-medium text-foreground tabular-nums">
                {formatPrice(subtotalInCents)}
              </bdi>
            </div>
          )}

          <Button asChild className="w-full">
            <Link href={APP_ROUTES.CART} onClick={() => setOpen(false)}>
              <span>
                {tCart("VIEW_FULL_CART", { default: "عرض السلة الكاملة" })}
              </span>
              <ArrowIcon aria-hidden="true" className="ms-1.5 size-4" />
            </Link>
          </Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}
