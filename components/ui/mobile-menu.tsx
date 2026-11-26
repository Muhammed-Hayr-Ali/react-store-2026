/**
 * @file components/ui/mobile-menu.tsx
 * @description Mobile menu drawer component with vertically centered close button and default button interaction states.
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

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
  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  return (
    <div
      className={cn(
        "fixed inset-0 top-12 z-50 transition-opacity duration-300 md:hidden",
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
        className
      )}
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn(
          "absolute inset-0 h-full w-full transform border-t border-r bg-background transition-transform duration-300 ease-in-out rtl:border-r-0 rtl:border-l",
          isOpen
            ? "translate-x-0"
            : "ltr:-translate-x-full rtl:translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="flex h-full flex-col">{children}</nav>
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
      "relative flex shrink-0 items-center gap-2 border-b p-4 pe-12",
      className
    )}
    {...props}
  >
    {children}
    {showCloseButton && (
      <button
        type="button"
        // التوسيط الرأسي مع بقاء تأثيرات الزر الافتراضية كما هي
        className="absolute inset-e-4 top-1/2 -translate-y-1/2"
        onClick={onClose}
        aria-label="Close menu"
      >
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
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
    className={cn("min-h-0 flex-1 overflow-y-auto py-4", className)}
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
    className={cn("mt-auto shrink-0 border-t border-muted p-4", className)}
    {...props}
  >
    {children}
  </div>
))
MobileMenuFooter.displayName = "MobileMenuFooter"

export { MobileMenu, MobileMenuHeader, MobileMenuBody, MobileMenuFooter }