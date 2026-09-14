"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
}

const MobileMenu = ({ isOpen, onOpenChange, children }: MobileMenuProps) => {
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
          : "pointer-events-none opacity-0"
      )}
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn(
          "absolute left-0 h-screen w-full transform border-t border-r bg-background transition-transform duration-300 ease-in-out rtl:right-0 rtl:left-0",
          isOpen
            ? "translate-x-0"
            : "ltr:-translate-x-full rtl:translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="flex h-[calc(100vh-7rem)] flex-col">{children}</nav>
      </div>
    </div>
  )
}

const MobileMenuHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("shrink-0 border-b p-4", className)} {...props}>
    {children}
  </div>
))
MobileMenuHeader.displayName = "MobileMenuHeader"

const MobileMenuBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grow overflow-y-auto py-4", className)}
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
    className={cn("shrink-0 border-t border-muted p-4", className)}
    {...props}
  >
    {children}
  </div>
))
MobileMenuFooter.displayName = "MobileMenuFooter"


export {
  MobileMenu,
  MobileMenuHeader,
  MobileMenuBody,
  MobileMenuFooter,
}
