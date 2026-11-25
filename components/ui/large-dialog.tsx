"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function LargeDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="large-dialog" {...props} />
}

function LargeDialogTrigger({
  render,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & {
  render?: React.ReactElement
}) {
  if (render) {
    return (
      <DialogPrimitive.Trigger
        data-slot="large-dialog-trigger"
        {...props}
        asChild
      >
        {render}
      </DialogPrimitive.Trigger>
    )
  }

  return (
    <DialogPrimitive.Trigger data-slot="large-dialog-trigger" {...props}>
      {children}
    </DialogPrimitive.Trigger>
  )
}

function LargeDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="large-dialog-portal" {...props} />
}

function LargeDialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="large-dialog-close" {...props} />
}

/**
 * ملاحظة مهمة: Radix يضع data-state="open|closed" وليس data-open / data-closed
 * (تلك خاصة بـ Base UI)، لذلك كانت حركات الدخول والخروج لا تعمل.
 */
function LargeDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="large-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/50 backdrop-blur-[2px] duration-150",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

function LargeDialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  /** نص قارئ الشاشة لزر الإغلاق (مرّر النص المترجم) */
  closeLabel?: string
}) {
  return (
    <LargeDialogPortal>
      <LargeDialogOverlay />
      <DialogPrimitive.Content
        data-slot="large-dialog-content"
        className={cn(
          // التمركز: inset-s + translate مع عكس الاتجاه في RTL
          "fixed inset-s-1/2 top-1/2 z-50 flex h-auto max-h-[90vh] w-fit max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl bg-popover p-5 text-xs/relaxed text-popover-foreground shadow-2xl ring-1 ring-foreground/10 outline-none duration-150 rtl:translate-x-1/2",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="large-dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute end-3 top-3 z-10"
              size="icon-sm"
            >
              <XIcon aria-hidden="true" />
              <span className="sr-only">{closeLabel}</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </LargeDialogPortal>
  )
}

function LargeDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="large-dialog-header"
      className={cn("flex shrink-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function LargeDialogFooter({
  className,
  showCloseButton = false,
  closeLabel = "Close",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  closeLabel?: string
}) {
  return (
    <div
      data-slot="large-dialog-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">{closeLabel}</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function LargeDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="large-dialog-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  )
}

function LargeDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="large-dialog-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  LargeDialog,
  LargeDialogClose,
  LargeDialogContent,
  LargeDialogDescription,
  LargeDialogFooter,
  LargeDialogHeader,
  LargeDialogOverlay,
  LargeDialogPortal,
  LargeDialogTitle,
  LargeDialogTrigger,
}