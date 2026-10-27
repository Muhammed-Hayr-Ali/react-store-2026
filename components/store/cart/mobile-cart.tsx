"use client"

import { useCart } from "@/lib/context/cart-context"
import { useCurrency } from "@/lib/context/currency-context"
import { useTranslations } from "next-intl"
import React from "react"

import {
  MobileMenu as MenuDrawer,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuHeader,
} from "@/components/ui/mobile-menu"
import { ShoppingBagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CartItemCard } from "./cart-item-card"
import { cn } from "@/lib/utils"

interface MobileCardDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileCardDrawer({
  isOpen,
  onClose,
}: MobileCardDrawerProps) {
  const t = useTranslations("Cart")
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
    <MenuDrawer isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <MobileMenuHeader
        onClose={() => onClose()}
      >
        <p className="text-base leading-tight font-semibold text-foreground">
          {t("TITLE", { default: "Shopping Cart" })}
        </p>

        <p className="mt-0.5 truncate font-mono text-xs leading-tight text-muted-foreground">
          ({totalItemsCount})
        </p>
      </MobileMenuHeader>
      <MobileMenuBody
        className={cn(
          "px-2",
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
      </MobileMenuBody>
      {cart?.items && cart.items.length > 0 && (
        <MobileMenuFooter className="space-y-6">
          <div className="flex justify-between text-base font-semibold">
            <span>{t("SUBTOTAL", { default: "Subtotal" })}:</span>
            <div className="flex items-baseline gap-1.5">
              <span>{formatRawPrice(subtotal)}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {currentCurrency.symbol}
              </span>{" "}
            </div>
          </div>

          <Button
            variant="default"
            className="h-9 w-full text-xs font-medium uppercase shadow-xs"
            asChild
            onClick={onClose}
          >
            <Link href="/checkout">
              {t("CHECKOUT", { default: "Proceed to Checkout" })}
            </Link>
          </Button>
        </MobileMenuFooter>
      )}
    </MenuDrawer>
  )
}
