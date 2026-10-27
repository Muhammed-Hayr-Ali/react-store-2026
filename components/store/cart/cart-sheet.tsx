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
  SheetDescription,
} from "@/components/ui/sheet"
import { SearchIcon, ShoppingBagIcon, ShoppingCartIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCart } from "@/lib/context/cart-context"
import { useCurrency } from "@/lib/context/currency-context"
import { CartItemCard } from "./cart-item-card"
import { cn } from "@/lib/utils"

interface CartSheetProps {
  children?: React.ReactNode
}

export function CartSheet({ children }: CartSheetProps) {
  const t = useTranslations("Cart")
  const { cart, updateItemQuantity, removeItem, isPending, totalItemsCount } =
    useCart()
  const { formatRawPrice, currentCurrency } = useCurrency()

  return (
    <div className="flex flex-wrap gap-2">
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
        <SheetContent className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]">
          <SheetHeader>
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
              "h-full px-2",
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
                    isPending={isPending}
                    onUpdateQuantity={updateItemQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>
          {cart?.items && cart.items.length > 0 && (
            <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
