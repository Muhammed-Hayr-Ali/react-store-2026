"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

interface BottomSheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  onClose?: () => void
}

const BottomSheetContext = React.createContext<BottomSheetContextValue | null>(
  null
)

function useBottomSheet() {
  const ctx = React.useContext(BottomSheetContext)
  if (!ctx) {
    throw new Error("BottomSheet components must be used within <BottomSheet>")
  }
  return ctx
}

interface BottomSheetProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  children?: React.ReactNode
}

const BottomSheet = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onClose,
  children,
}: BottomSheetProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
      if (!nextOpen) {
        onClose?.()
      }
    },
    [isControlled, onOpenChange, onClose]
  )

  return (
    <BottomSheetContext.Provider value={{ open, setOpen, onClose }}>
      {children}
    </BottomSheetContext.Provider>
  )
}

interface BottomSheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const BottomSheetTrigger = React.forwardRef<
  HTMLButtonElement,
  BottomSheetTriggerProps
>(({ asChild = false, onClick, children, ...props }, ref) => {
  const { setOpen } = useBottomSheet()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(true)
    }
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLElement>) => void
      ref?: React.Ref<HTMLElement>
    }>
    return React.cloneElement(child, {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(true)
        }
      },
      "aria-expanded": undefined,
      ...props,
    })
  }

  return (
    <button ref={ref} type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
})
BottomSheetTrigger.displayName = "BottomSheetTrigger"

interface BottomSheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const BottomSheetClose = React.forwardRef<
  HTMLButtonElement,
  BottomSheetCloseProps
>(({ asChild = false, onClick, children, ...props }, ref) => {
  const { setOpen } = useBottomSheet()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(false)
    }
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLElement>) => void
    }>
    return React.cloneElement(child, {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(false)
        }
      },
      ...props,
    })
  }

  return (
    <button ref={ref} type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
})
BottomSheetClose.displayName = "BottomSheetClose"

interface BottomSheetContentProps {
  children?: React.ReactNode
  className?: string
  overlayClassName?: string
  closeOnBackdropClick?: boolean
  ariaLabel?: string
}

const BottomSheetContent = ({
  children,
  className,
  overlayClassName,
  closeOnBackdropClick = true,
  ariaLabel = "Bottom sheet",
}: BottomSheetContentProps) => {
  const { open, setOpen } = useBottomSheet()
  const panelRef = React.useRef<HTMLDivElement>(null)

  const setOpenRef = React.useRef(setOpen)
  React.useEffect(() => {
    setOpenRef.current = setOpen
  }, [setOpen])

  React.useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    if (!panel) return

    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"
    panel.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return

      if (event.key === "Escape") {
        event.preventDefault()
        setOpenRef.current(false)
        return
      }

      if (event.key !== "Tab") return

      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.closest("[inert]") && el.getClientRects().length > 0)

      const first = items[0]
      const last = items[items.length - 1]

      if (!first || !last) {
        event.preventDefault()
        return
      }

      const active = document.activeElement
      const isOutside = !panel.contains(active)

      if (
        event.shiftKey &&
        (active === first || active === panel || isOutside)
      ) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || isOutside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow

      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [open])

  return (
    <div
      inert={!open}
      className={cn(
        "fixed inset-0 z-50 flex flex-col justify-end overflow-hidden",
        open
          ? "visible"
          : "pointer-events-none invisible transition-[visibility] duration-300"
      )}
    >
      {/* خلفية معتمة بتأثير زجاجي مصنفر */}
      <div
        aria-hidden="true"
        onClick={() => {
          if (closeOnBackdropClick) setOpen(false)
        }}
        className={cn(
          "fixed inset-0 bg-black/35 backdrop-blur-md backdrop-saturate-150 transition-opacity",
          open
            ? "opacity-100 duration-280 ease-out starting:opacity-0"
            : "opacity-0 duration-180 ease-out",
          overlayClassName
        )}
      />

      {/* لوحة الـ BottomSheet بتأثير زجاجي شفاف */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[88dvh] w-full flex-col rounded-t-3xl border-t border-white/25 bg-background/80 shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.18)] backdrop-blur-2xl backdrop-saturate-150 outline-none dark:border-white/10 dark:bg-background/75",
          "transition-[translate,transform,opacity] will-change-[translate,opacity]",
          open
            ? "translate-y-0 opacity-100 duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] starting:translate-y-8"
            : "opacity-0 duration-180 ease-out motion-safe:translate-y-8",
          className
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col transition-[translate,transform,opacity] ease-out",
            open
              ? "translate-y-0 opacity-100 delay-100 duration-300"
              : "opacity-0 duration-150 motion-safe:translate-y-4"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

interface BottomSheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
  showHandle?: boolean
  onClose?: () => void
}

const BottomSheetHeader = React.forwardRef<
  HTMLDivElement,
  BottomSheetHeaderProps
>(
  (
    {
      className,
      children,
      showCloseButton = true,
      showHandle = true,
      onClose,
      ...props
    },
    ref
  ) => {
    const { setOpen } = useBottomSheet()

    const handleClose = () => {
      setOpen(false)
      onClose?.()
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex shrink-0 flex-col border-b border-border/50 px-4 pt-2.5 pb-3.5",
          className
        )}
        {...props}
      >
        {showHandle && (
          <div className="flex w-full justify-center pb-2">
            <span
              aria-hidden="true"
              className="h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30"
            />
          </div>
        )}
        <div
          className={cn(
            "relative flex flex-col items-start gap-1 text-start",
            showCloseButton && "min-h-8 pe-11"
          )}
        >
          {children}
          {showCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close sheet"
              className="absolute inset-e-0 -top-0.5 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)
BottomSheetHeader.displayName = "BottomSheetHeader"

const BottomSheetBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
BottomSheetBody.displayName = "BottomSheetBody"

const BottomSheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto shrink-0 border-t border-border/50 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
BottomSheetFooter.displayName = "BottomSheetFooter"

export {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
}