import { TruckIcon, RotateCcwIcon, ShieldCheckIcon } from "lucide-react"

export function ProductTrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center text-[11px] text-muted-foreground">
      <div className="flex flex-col items-center gap-1">
        <TruckIcon className="size-4 text-foreground/70" />
        <span>Fast Dispatch</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <RotateCcwIcon className="size-4 text-foreground/70" />
        <span>Easy Returns</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ShieldCheckIcon className="size-4 text-foreground/70" />
        <span>Secure Checkout</span>
      </div>
    </div>
  )
}
