/**
 * @file components/store/cart/cart-sheet.tsx
 * @description Slide-over cart sheet displaying cart items, quantities, totals, and actions with multi-currency support.
 */

"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { ShoppingBagIcon, ShoppingCartIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useCart } from "@/lib/context/cart-context"
import { useCurrency } from "@/lib/context/currency-context"
import { CartItemCard } from "./cart-item-card"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function CartSheet() {
  const t = useTranslations("Cart")
  const locale = useLocale()
  const isRtl = ["ar", "fa", "ur", "he"].includes(locale)
  const { cart, updateItemQuantity, removeItem, isPending, totalItemsCount } =
    useCart()
  const { formatRawPrice, currentCurrency } = useCurrency()

  const subtotal = React.useMemo(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((acc, item) => {
      const price = item.product_variants?.price || 0
      return acc + price * item.quantity
    }, 0)
  }, [cart])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Search"
          className="relative"
        >
          <ShoppingCartIcon />
          {totalItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-foreground text-[10px] font-normal text-background">
              {totalItemsCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isRtl ? "left" : "right"}
        className="max-h-dvh gap-0 p-0 "
      >
        <SheetHeader className="border-b px-2 py-4">
          <SheetTitle className="flex w-full items-center justify-start gap-2">
            <p className="text-base leading-tight font-semibold text-foreground">
              {t("TITLE", { default: "Shopping Cart" })}
            </p>

            <p className="mt-0.5 truncate font-mono text-xs leading-tight text-muted-foreground">
              ({totalItemsCount})
            </p>
          </SheetTitle>
        </SheetHeader>
        <div
          className={cn(
            "h-full px-2 py-3",
            (!cart?.items || cart.items.length === 0) &&
              "flex items-center justify-center pb-20"
          )}
        >
          {!cart?.items || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
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
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>
        {cart?.items && cart.items.length > 0 && (
          <SheetFooter className="space-y-2 border-t px-2 py-4">
            <div className="flex justify-between text-base font-semibold">
              <span>{t("SUBTOTAL", { default: "Subtotal" })}:</span>
              <div className="flex items-baseline gap-1.5">
                <span>{formatRawPrice(subtotal)}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentCurrency.symbol}
                </span>
              </div>
            </div>
            <SheetClose>
              <Button
                variant="default"
                className="h-9 w-full text-xs font-medium uppercase shadow-xs"
                asChild
              >
                <Link href="/checkout">
                  {t("CHECKOUT", { default: "Proceed to Checkout" })}
                </Link>
              </Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
