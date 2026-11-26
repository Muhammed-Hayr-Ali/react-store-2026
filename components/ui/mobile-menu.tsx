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

interface MobileMenuProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
  className?: string
}

const MobileMenu = ({
  isOpen,
  onOpenChange,
  children,
  className,
}: MobileMenuProps) => {
  const panelRef = React.useRef<HTMLDivElement>(null)

  // يمنع إعادة تشغيل التأثير عند تغير مرجع الدالة
  const onOpenChangeRef = React.useRef(onOpenChange)
  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  React.useEffect(() => {
    if (!isOpen) return

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
        onOpenChangeRef.current(false)
        return
      }

      if (event.key !== "Tab") return

      // حصر التنقل بلوحة المفاتيح داخل القائمة
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
  }, [isOpen])

  return (
    <div
      inert={!isOpen}
      className={cn(
        "fixed inset-0 top-12 z-50 overflow-hidden",
        // عند الإغلاق: تبقى القائمة مرئية حتى تنتهي الحركة
        isOpen
          ? "visible"
          : "pointer-events-none invisible transition-[visibility] duration-300",
        className
      )}
    >
      {/* لوحة بملء المساحة: تصعد من الأسفل مع تلاشٍ */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabIndex={-1}
        className={cn(
          "absolute inset-0 flex flex-col border-t bg-background/90 backdrop-blur-xl outline-none",
          "transition-[translate,transform,opacity] will-change-[translate,opacity]",
          isOpen
            ? "translate-y-0 opacity-100 duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] starting:translate-y-8"
            : "opacity-0 duration-180 ease-out motion-safe:translate-y-8"
        )}
      >
        {/* ظهور المحتوى بتأخير بسيط بعد اللوحة */}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col transition-[translate,transform,opacity] ease-out",
            isOpen
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

interface MobileMenuHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
  onClose?: () => void
}

const MobileMenuHeader = React.forwardRef<
  HTMLDivElement,
  MobileMenuHeaderProps
>(({ className, children, showCloseButton = true, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex shrink-0 items-center gap-2 border-b p-4 pe-14",
      className
    )}
    {...props}
  >
    {children}
    {showCloseButton && (
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute inset-e-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
      >
        <XIcon aria-hidden="true" className="size-4" />
      </button>
    )}
  </div>
))
MobileMenuHeader.displayName = "MobileMenuHeader"

const MobileMenuBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-h-0 flex-1 overflow-y-auto overscroll-contain py-4",
      className
    )}
    {...props}
  >
    <nav className="grid gap-2">{children}</nav>
  </div>
))
MobileMenuBody.displayName = "MobileMenuBody"

const MobileMenuFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto shrink-0 border-t border-muted p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
MobileMenuFooter.displayName = "MobileMenuFooter"

export { MobileMenu, MobileMenuHeader, MobileMenuBody, MobileMenuFooter }
