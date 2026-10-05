"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLocale } from "next-intl"
import {
  BellIcon,
  CheckCircle2Icon,
  XIcon,
  AlertCircleIcon,
  UserIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CustomSheet,
  CustomSheetClose,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetFooter,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/ui/custom-sheet"

import { createNotificationSchema } from "@/lib/actions/notifications/schemas"
import { createNotification } from "@/lib/actions/notifications/mutations/create-notification"

type NotificationFormValues = z.infer<typeof createNotificationSchema>

interface NotificationFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  users?: {
    id: string
    first_name?: string | null
    last_name?: string | null
    email?: string | null
  }[]
  onSuccess?: () => void
}

function getSide({ isMobile, locale }: { isMobile: boolean; locale: string }) {
  const dir = locale === "ar" ? "left" : "right"
  return isMobile ? "bottom" : dir
}

export default function NotificationForm({
  isOpen,
  onOpenChange,
  users = [],
  onSuccess,
}: NotificationFormProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const side = getSide({ isMobile, locale })
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

const {
  register,
  control,
  handleSubmit,
  reset,
  formState: { errors, isSubmitting },
} = useForm({
  resolver: zodResolver(createNotificationSchema),
  defaultValues: {
    userId: "",
    title: "",
    message: "",
    type: "info" as const,
    link: "",
  },
})
  const messageValue = useWatch({ control, name: "message" }) || ""

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(null)
      reset()
    }
    onOpenChange(open)
  }

  async function onSubmit(data: NotificationFormValues) {
    setErrorMessage(null)

    const payload = {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link ? data.link : null,
    }

    const result = await createNotification(payload)

    if (result.success) {
      toast.success("Notification sent successfully!")
      onSuccess?.()
      handleOpenChange(false)
      router.refresh()
    } else {
      setErrorMessage(
        result.error || "Failed to send notification. Please try again."
      )
    }
  }

  return (
    <CustomSheet open={isOpen} onOpenChange={handleOpenChange}>
      <CustomSheetContent
        showCloseButton={false}
        side={side}
        className="flex w-full flex-col p-0 sm:max-w-xl"
      >
        <CustomSheetHeader className="pt-safe shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CustomSheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Send Notification
              </CustomSheetTitle>
              <CustomSheetDescription className="text-xs text-muted-foreground">
                Dispatch a targeted notification alert directly to a user
                account.
              </CustomSheetDescription>
            </div>
            <CustomSheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" />
              </Button>
            </CustomSheetClose>
          </div>
        </CustomSheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="notification-form-element"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 pb-8"
          >
            {errorMessage && (
              <Alert variant="destructive" className="relative pr-9">
                <AlertCircleIcon className="size-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription className="text-xs">
                  {errorMessage}
                </AlertDescription>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="absolute top-3 right-3 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-4" />
                </button>
              </Alert>
            )}

            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <UserIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Recipient & Classification
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={Boolean(errors.userId)}>
                      <FieldLabel htmlFor="notif-user" className="text-xs">
                        Target User <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="notif-user" className="h-8 text-xs">
                          <SelectValue placeholder="Select target user..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => {
                            const fullName = [u.first_name, u.last_name]
                              .filter(Boolean)
                              .join(" ")
                            return (
                              <SelectItem
                                key={u.id}
                                value={u.id}
                                className="text-xs"
                              >
                                {fullName || u.email || u.id}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      {errors.userId && (
                        <p className="text-[11px] text-destructive">
                          {errors.userId.message}
                        </p>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={Boolean(errors.type)}>
                      <FieldLabel htmlFor="notif-type" className="text-xs">
                        Notification Type{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="notif-type" className="h-8 text-xs">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info" className="text-xs">
                            Info
                          </SelectItem>
                          <SelectItem value="success" className="text-xs">
                            Success
                          </SelectItem>
                          <SelectItem value="warning" className="text-xs">
                            Warning
                          </SelectItem>
                          <SelectItem value="error" className="text-xs">
                            Error
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-[11px] text-destructive">
                          {errors.type.message}
                        </p>
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <BellIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Content Details
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="notif-title" className="text-xs">
                    Title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="notif-title"
                    placeholder="e.g., Account Update"
                    {...register("title")}
                    className="h-8 text-xs"
                  />
                  {errors.title && (
                    <p className="text-[11px] text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="notif-msg" className="text-xs">
                      Message <span className="text-destructive">*</span>
                    </FieldLabel>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {messageValue.length}/500
                    </span>
                  </div>
                  <InputGroup className="bg-background">
                    <InputGroupTextarea
                      id="notif-msg"
                      placeholder="Write notification message contents here..."
                      rows={3}
                      {...register("message")}
                      className="resize-y text-xs"
                    />
                  </InputGroup>
                  {errors.message && (
                    <p className="text-[11px] text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <FieldLabel htmlFor="notif-link" className="text-xs">
                    Action Link (Optional)
                  </FieldLabel>
                  <Input
                    id="notif-link"
                    placeholder="/dashboard/orders/123"
                    {...register("link")}
                    className="h-8 text-xs"
                  />
                  {errors.link && (
                    <p className="text-[11px] text-destructive">
                      {errors.link.message}
                    </p>
                  )}
                </div>
              </FieldGroup>
            </div>
          </form>
        </div>

        <CustomSheetFooter className="shrink-0 border-t bg-card px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex w-full flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <CustomSheetClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full cursor-pointer sm:w-auto"
              >
                Cancel
              </Button>
            </CustomSheetClose>
            <Button
              type="submit"
              form="notification-form-element"
              disabled={isSubmitting}
              className="w-full cursor-pointer shadow-xs sm:w-auto sm:min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="mr-1.5 size-4" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </CustomSheetFooter>
      </CustomSheetContent>
    </CustomSheet>
  )
}
