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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"

export function CartSheet() {
  const t = useTranslations("Cart")
  const locale = useLocale()
  const isRtl = ["ar", "fa", "ur", "he"].includes(locale)
  const { cart, totalItemsCount, isPending } = useCart()
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
          {totalItemsCount > 0 &&
            (isPending ? (
              <Spinner className="absolute -top-1 -right-1 size-3.5" />
            ) : (
              <span
                className={cn(
                  "absolute -top-1 -right-1 flex size-3.5 h-3.5 items-center justify-center rounded-full bg-foreground p-1.5 text-[9px] font-normal text-background transition-transform"
                )}
              >
                {totalItemsCount > 99 ? "99+" : totalItemsCount}
              </span>
            ))}
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isRtl ? "left" : "right"}
        // تحويل محتوى الـ Sheet إلى Flex العمودي لضبط الارتفاعات بدقة
        className="flex h-dvh flex-col p-0 sm:max-w-md"
      >
        {/* رأس الشيت (ثابت) */}
        <SheetHeader className="shrink-0 border-b px-4 py-4">
          <SheetTitle className="flex w-full items-center justify-start gap-2">
            <p className="text-base leading-tight font-semibold text-foreground">
              {t("TITLE", { default: "Shopping Cart" })}
            </p>

            <p className="mt-0.5 truncate font-mono text-xs leading-tight text-muted-foreground">
              ({totalItemsCount})
            </p>
          </SheetTitle>
        </SheetHeader>

        {/* منطقة المنتجات القابلة للتمرير (تأخذ المساحة المتبقية بمرونة باستخدام h-0 و grow) */}
        <ScrollArea
          className={cn("h-0 grow py-2", isRtl ? "pr-2.5 pl-4" : "pr-4 pl-2.5")}
        >
          <div
            className={cn(
              "h-full",
              (!cart?.items || cart.items.length === 0) &&
                "flex h-full items-center justify-center pb-20"
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
              <div className="space-y-3 py-2">
                {cart.items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* تذييل الشيت والمجاميع (ثابت في الأسفل) */}
        {cart?.items && cart.items.length > 0 && (
          <SheetFooter className="shrink-0 space-y-3 border-t bg-background px-4 py-4">
            <div className="flex justify-between text-base font-semibold">
              <span>{t("SUBTOTAL", { default: "Subtotal" })}:</span>
              <div className="flex items-baseline gap-1.5">
                <span>{formatRawPrice(subtotal)}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentCurrency.symbol}
                </span>
              </div>
            </div>
            <SheetClose asChild>
              <Button
                variant="default"
                className="h-9 w-full text-xs font-medium uppercase shadow-xs"
                disabled={isPending}
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
