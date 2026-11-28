"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Link, usePathname } from "@/i18n/navigation"
import { APP_ROUTES } from "@/lib/config/app-routes"
import { useCart } from "@/lib/context/cart-context"
import { useCurrency } from "@/lib/context/currency-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDebouncedCartQuantity } from "@/hooks/use-debounced-cart-quantity"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTrigger,
} from "@/components/shared/bottom-sheet"
import { focusRing, headerActionClass } from "./store-header-shared"

interface CartButtonProps {
  variant?: "header" | "sticky"
  className?: string
}

interface HeaderCartImage {
  url: string
  is_primary?: boolean | null
}

interface HeaderCartItem {
  id: string
  quantity: number | string
  resolved_image_url?: string | null
  products: {
    name: string
    slug: string
    product_images: HeaderCartImage[]
  }
  product_variants?: {
    price?: number | string | null
    sku?: string | null
    track_inventory?: boolean | null
    stock_quantity?: number | null
  } | null
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
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const [open, setOpen] = React.useState(false)
  const { cart, totalItemsCount, updateItemQuantity, removeItem, isPending } =
    useCart()
  const { formatPrice } = useCurrency()
  const { drafts, setQuantity, remove, flush } = useDebouncedCartQuantity({
    updateItemQuantity,
    removeItem,
  })

  // عند إغلاق اللوحة (أو الانتقال منها) نرسل التعديلات المؤجلة فوراً
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) flush()
    setOpen(nextOpen)
  }

  // إذا كان المستخدم في صفحة السلة أو إتمام الطلب، نبقيه رابطاً مباشراً دون فتح لوحة
  const isCartOrCheckoutPage =
    pathname === APP_ROUTES.CART ||
    pathname.startsWith(`${APP_ROUTES.CART}/`) ||
    pathname.startsWith("/checkout")

  const cartLabel = t("cartAriaLabel")

  const items: HeaderCartItem[] = Array.isArray(cart?.items)
    ? (cart.items as HeaderCartItem[])
    : []

  // الأسعار مخزنة بالسنتات، فتمرر إلى formatPrice كما هي
  const subtotalInCents: number = items.reduce(
    (acc: number, item: HeaderCartItem) => {
      const unitPriceInCents = Number(item.product_variants?.price ?? 0)
      const quantity = drafts[item.id] ?? Number(item.quantity)
      return acc + unitPriceInCents * quantity
    },
    0
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

  const triggerButton = (
    <button
      type="button"
      aria-label={cartLabel}
      className={triggerClassName}
    >
      {buttonContent}
    </button>
  )

  // داخل صفحة السلة أو إتمام الطلب: رابط مباشر دون تكرار
  if (isCartOrCheckoutPage) {
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

  // على الجوال: BottomSheet مريح للمس
  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={handleOpenChange}>
        <BottomSheetTrigger asChild>{triggerButton}</BottomSheetTrigger>

        <BottomSheetContent ariaLabel={cartLabel}>
          <BottomSheetHeader>
            <div className="flex items-center gap-2">
              <span className="text-base font-normal text-foreground">
                {t("cart")}
              </span>
              {totalItemsCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                  {totalItemsCount}
                </span>
              )}
            </div>
          </BottomSheetHeader>

          <BottomSheetBody className="px-4 py-3.5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 py-10 text-center">
                <ShoppingBag
                  aria-hidden="true"
                  className="size-9 text-muted-foreground/50"
                />
                <p className="text-sm text-muted-foreground">
                  {tCart("EMPTY_CART", { default: "سلة التسوق فارغة" })}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {items.map((item: HeaderCartItem) => {
                  const serverQty = Number(item.quantity)
                  const qty = drafts[item.id] ?? serverQty
                  const product = item.products
                  const variantInfo = item.product_variants
                  const imageUrl =
                    item.resolved_image_url ??
                    product.product_images.find(
                      (img: HeaderCartImage) => img.is_primary
                    )?.url ??
                    product.product_images[0]?.url ??
                    null

                  const maxStock =
                    variantInfo?.track_inventory &&
                    typeof variantInfo.stock_quantity === "number"
                      ? variantInfo.stock_quantity
                      : Infinity
                  const canIncrease = qty < maxStock

                  const unitPriceInCents = Number(variantInfo?.price ?? 0)

                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => handleOpenChange(false)}
                        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-muted/40"
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            width={56}
                            height={56}
                            unoptimized
                            className="size-full object-cover"
                          />
                        ) : (
                          <ShoppingBag
                            aria-hidden="true"
                            className="size-5 text-muted-foreground/50"
                          />
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={() => handleOpenChange(false)}
                          className="block truncate text-sm font-normal text-foreground transition-colors hover:text-primary"
                        >
                          {product.name}
                        </Link>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {unitPriceInCents > 0 && (
                            <bdi className="font-mono tabular-nums text-foreground/85">
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

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          disabled={qty <= 1 && isPending}
                          aria-label={tCart("DECREASE_QUANTITY", {
                            default: "إنقاص الكمية",
                          })}
                          onClick={() =>
                            qty <= 1
                              ? remove(item.id)
                              : setQuantity(item.id, qty - 1, serverQty)
                          }
                          className="flex size-9 items-center justify-center rounded-xl border border-border/60 text-foreground transition-colors hover:bg-muted active:scale-95 disabled:opacity-50"
                        >
                          {qty <= 1 ? (
                            <Trash2 className="size-4 text-destructive" />
                          ) : (
                            <Minus className="size-4" />
                          )}
                        </button>

                        <span className="w-7 text-center text-sm tabular-nums">
                          {qty}
                        </span>

                        <button
                          type="button"
                          disabled={!canIncrease}
                          aria-label={tCart("INCREASE_QUANTITY", {
                            default: "زيادة الكمية",
                          })}
                          onClick={() =>
                            setQuantity(item.id, qty + 1, serverQty)
                          }
                          className="flex size-9 items-center justify-center rounded-xl border border-border/60 text-foreground transition-colors hover:bg-muted active:scale-95 disabled:opacity-50"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </BottomSheetBody>

          <BottomSheetFooter className="flex flex-col gap-3">
            {items.length > 0 && subtotalInCents > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{tCart("SUBTOTAL", { default: "الإجمالي الفرعي" })}</span>
                <bdi className="font-mono text-base font-medium tabular-nums text-foreground">
                  {formatPrice(subtotalInCents)}
                </bdi>
              </div>
            )}

            <Button asChild size="lg" className="h-11 w-full rounded-xl text-sm">
              <Link href={APP_ROUTES.CART} onClick={() => handleOpenChange(false)}>
                {tCart("VIEW_FULL_CART", { default: "عرض سلة التسوق" })}
              </Link>
            </Button>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    )
  }

  // على سطح المكتب: Popover متوازن ومضغوط
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 rounded-2xl border-border/60 p-3.5 font-normal shadow-xl"
      >
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            {tCart("CART_TITLE", { default: "سلة التسوق" })}
          </h3>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <ShoppingBag
              aria-hidden="true"
              className="size-7 text-muted-foreground/45"
            />
            <p className="text-xs text-muted-foreground">
              {tCart("EMPTY_CART", { default: "سلة التسوق فارغة" })}
            </p>
          </div>
        ) : (
          <>
            <ul className="max-h-64 space-y-2.5 overflow-y-auto">
              {items.map((item: HeaderCartItem) => {
                const qty = drafts[item.id] ?? Number(item.quantity)
                const product = item.products
                const variantInfo = item.product_variants
                const imageUrl =
                  item.resolved_image_url ??
                  product.product_images.find(
                    (img: HeaderCartImage) => img.is_primary
                  )?.url ??
                  product.product_images[0]?.url ??
                  null

                const unitPriceInCents = Number(variantInfo?.price ?? 0)

                return (
                  <li key={item.id} className="flex items-center gap-2.5">
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={() => handleOpenChange(false)}
                      className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-muted/35 p-1"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="size-full object-contain"
                        />
                      ) : (
                        <ShoppingBag
                          aria-hidden="true"
                          className="size-4 text-muted-foreground/45"
                        />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1 text-start">
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => handleOpenChange(false)}
                        className="line-clamp-2 text-xs leading-snug text-foreground transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>

                      {unitPriceInCents > 0 && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                          <bdi>
                            {qty} &times; {formatPrice(unitPriceInCents)}
                          </bdi>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      aria-label={tCart("REMOVE_ITEM", {
                        default: "إزالة المنتج",
                      })}
                      onClick={() => remove(item.id)}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
                    >
                      <XIcon aria-hidden="true" className="size-3.5" />
                    </button>
                  </li>
                )
              })}
            </ul>

            {subtotalInCents > 0 && (
              <div className="mt-3 flex items-center justify-start gap-1 text-xs text-muted-foreground">
                <span>{tCart("SUBTOTAL", { default: "المجموع الفرعي" })}</span>
                <bdi className="tabular-nums text-foreground">
                  {formatPrice(subtotalInCents)}
                </bdi>
              </div>
            )}

            <div className="mt-3 flex flex-col items-start gap-2 text-xs">
              <Link
                href={APP_ROUTES.CART}
                onClick={() => handleOpenChange(false)}
                className="text-primary transition-opacity hover:opacity-80"
              >
                {tCart("VIEW_FULL_CART", { default: "عرض سلة التسوق" })}
              </Link>

              <Link
                href="/checkout"
                onClick={() => handleOpenChange(false)}
                className="text-primary transition-opacity hover:opacity-80"
              >
                {tCart("PROCEED_TO_CHECKOUT", {
                  default: "المتابعة لإتمام الشراء",
                })}
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}