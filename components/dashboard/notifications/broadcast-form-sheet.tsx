"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MegaphoneIcon, XIcon, AlertCircleIcon, UsersIcon } from "lucide-react"

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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { broadcastNotificationSchema } from "@/lib/actions/notifications/schemas"
import { broadcastNotification } from "@/lib/actions/notifications/mutations/create-notification"

type BroadcastFormValues = z.infer<typeof broadcastNotificationSchema>

interface BroadcastFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function BroadcastForm({
  isOpen,
  onOpenChange,
  onSuccess,
}: BroadcastFormProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(broadcastNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info" as const,
      link: "",
      targetType: "all" as const,
      roleName: "",
    },
  })
  const targetType = useWatch({ control, name: "targetType" })
  const messageValue = useWatch({ control, name: "message" }) || ""

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(null)
      reset()
    }
    onOpenChange(open)
  }

  async function onSubmit(data: BroadcastFormValues) {
    setErrorMessage(null)

    const payload = {
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link ? data.link : null,
      targetType: data.targetType,
      roleName:
        data.targetType === "role" && data.roleName ? data.roleName : undefined,
    }

    const result = await broadcastNotification(payload)

    if (result.success) {
      const deliveredCount = result.data?.count ?? 0
      toast.success(`Broadcast sent successfully to ${deliveredCount} users!`)
      onSuccess?.()
      handleOpenChange(false)
      router.refresh()
    } else {
      setErrorMessage(
        result.error || "Failed to broadcast notification. Please try again."
      )
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <SheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            Broadcast Notification
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Send a mass alert announcement to all system users or specific
            roles.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="broadcast-form-element"
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
                <UsersIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Audience & Classification
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="targetType"
                    control={control}
                    render={({ field }) => (
                      <Field data-invalid={Boolean(errors.targetType)}>
                        <FieldLabel
                          htmlFor="broadcast-target"
                          className="text-xs"
                        >
                          Target Group{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            id="broadcast-target"
                            className="h-8 text-xs"
                          >
                            <SelectValue placeholder="Select target..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">
                              All Users
                            </SelectItem>
                            <SelectItem value="role" className="text-xs">
                              Specific Role
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.targetType && (
                          <p className="text-[11px] text-destructive">
                            {errors.targetType.message}
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
                        <FieldLabel
                          htmlFor="broadcast-type"
                          className="text-xs"
                        >
                          Alert Type <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            id="broadcast-type"
                            className="h-8 text-xs"
                          >
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
                </div>

                {targetType === "role" && (
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor="broadcast-role" className="text-xs">
                      Role Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="broadcast-role"
                      placeholder="e.g., admin, customer"
                      {...register("roleName")}
                      className="h-8 text-xs"
                    />
                    {errors.roleName && (
                      <p className="text-[11px] text-destructive">
                        {errors.roleName.message}
                      </p>
                    )}
                  </div>
                )}
              </FieldGroup>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <MegaphoneIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Announcement Details
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="broadcast-title" className="text-xs">
                    Title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="broadcast-title"
                    placeholder="e.g., System Maintenance Notice"
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
                    <FieldLabel htmlFor="broadcast-msg" className="text-xs">
                      Message <span className="text-destructive">*</span>
                    </FieldLabel>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {messageValue.length}/500
                    </span>
                  </div>
                  <InputGroup className="bg-background">
                    <InputGroupTextarea
                      id="broadcast-msg"
                      placeholder="Write broadcast notification details here..."
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
                  <FieldLabel htmlFor="broadcast-link" className="text-xs">
                    Action Link (Optional)
                  </FieldLabel>
                  <Input
                    id="broadcast-link"
                    placeholder="/dashboard"
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

        <SheetFooter className="shrink-0 border-t bg-card px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex w-full flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full cursor-pointer text-xs sm:w-auto"
              >
                Discard
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="broadcast-form-element"
              disabled={isSubmitting}
              className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-3.5" />
                  Broadcasting...
                </>
              ) : (
                "Send Broadcast"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
