/**
 * @file components/store/cart/cart-sheet.tsx
 * @description Slide-over cart sheet displaying cart items, quantities, totals, and actions with multi-currency support.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ShoppingBagIcon,
  Trash2Icon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/context/cart-context"
import { useCurrency } from "@/lib/context/currency-context"

export function CartSheet() {
  const t = useTranslations("Cart")
  const { cart, updateItemQuantity, removeItem, isPending, totalItemsCount } =
    useCart()
  const { formatPrice } = useCurrency()
  const [open, setOpen] = React.useState(false)

  // حساب المجموع الكلي للسلة بناءً على سعر الـ variant والكمية
  const subtotal = React.useMemo(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((acc, item) => {
      const price = item.product_variants?.price || 0
      return acc + price * item.quantity
    }, 0)
  }, [cart])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="relative">
          <ShoppingCartIcon />
          {totalItemsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-foreground text-[10px] font-normal text-background">
              {totalItemsCount}
            </span>
          )}
          <span className="sr-only">
            {t("OPEN_CART", { default: "Open cart" })}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBagIcon className="size-5" />
            {t("TITLE", { default: "Shopping Cart" })} ({totalItemsCount})
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        {/* محتوى السلة */}
        <div className="flex-1 overflow-y-auto pr-2">
          {!cart?.items || cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingBagIcon className="mb-4 size-16 stroke-1" />
              <p className="text-lg font-medium">
                {t("EMPTY", { default: "Your cart is empty" })}
              </p>
              <p className="text-sm">
                {t("EMPTY_DESC", {
                  default: "Add some products to start shopping",
                })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => {
                const product = item.products
                const variant = item.product_variants
                const imageUrl =
                  product?.product_images?.find((img) => img.is_primary)?.url ||
                  product?.product_images?.[0]?.url
                const itemUnitPrice = variant?.price || 0

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border bg-card p-3"
                  >
                    {/* صورة المنتج */}
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product?.name || "Product"}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    {/* تفاصيل المنتج */}
                    <div className="flex flex-1 flex-col">
                      <h4 className="line-clamp-1 text-sm font-semibold">
                        {product?.name}
                      </h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatPrice(itemUnitPrice)}
                      </p>

                      {/* أزرار التحكم بالكمية */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-none"
                            disabled={isPending || item.quantity <= 1}
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <MinusIcon className="size-3" />
                          </Button>
                          <span className="px-2 text-xs font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-none"
                            disabled={isPending}
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <PlusIcon className="size-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          disabled={isPending}
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* الفوتر والمجموع */}
        {cart?.items && cart.items.length > 0 && (
          <>
            <Separator className="my-4" />
            <SheetFooter className="flex flex-col gap-4 sm:flex-col">
              <div className="flex justify-between text-base font-semibold">
                <span>{t("SUBTOTAL", { default: "Subtotal" })}:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Button
                asChild
                className="w-full"
                size="lg"
                onClick={() => setOpen(false)}
              >
                <Link href="/checkout">
                  {t("CHECKOUT", { default: "Proceed to Checkout" })}
                </Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
