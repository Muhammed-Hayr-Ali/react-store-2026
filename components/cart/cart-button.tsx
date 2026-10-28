"use client"

/**
 * @file components/store/cart-button.tsx
 * @description Cart button component supporting native button props and custom icon sizing.
 */

import * as React from "react"
import { ShoppingCartIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/context/cart-context"

// إضافة خاصية اختيارية iconClassName للتحكم بحجم أو تنسيق الأيقونة
type CartButtonProps = React.ComponentProps<typeof Button> & {
  iconClassName?: string
}

export default function CartButton({
  className,
  iconClassName,
  ...props
}: CartButtonProps) {
  const { totalItemsCount, isPending } = useCart()

  return (
    <Button
      size="icon"
      aria-label="Cart"
      className={cn("relative", className)}
      {...props}
    >
      <ShoppingCartIcon className={cn("size-4", iconClassName)} />
      {totalItemsCount > 0 &&
        (isPending ? (
          <Spinner className="absolute -top-1 -right-1 size-3.5 text-primary" />
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
  )
}
