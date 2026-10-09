"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  BellIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  XIcon,
  AlertCircleIcon,
  UserIcon,
  PlusIcon,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  createNotificationSchema,
  type CreateNotificationInput,
} from "@/lib/actions/notifications/schemas"
import { createNotification } from "@/lib/actions/notifications"
import { cn } from "@/lib/utils"

export interface FormUserOption {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

interface NotificationFormProps {
  trigger?: React.ReactNode
  users?: FormUserOption[]
  onSuccess?: () => void
}

export default function NotificationForm({
  trigger,
  users = [],
  onSuccess,
}: NotificationFormProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [userPickerOpen, setUserPickerOpen] = React.useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateNotificationInput>({
    resolver: zodResolver(createNotificationSchema),
    defaultValues: {
      userId: "",
      title: "",
      message: "",
      type: "info",
      link: "",
    },
  })

  const selectedUserId = useWatch({ control, name: "userId" })
  const messageValue = useWatch({ control, name: "message" }) || ""

  const selectedUser = React.useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  )

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setErrorMessage(null)
      setUserPickerOpen(false)
      reset()
    }
  }

  async function onSubmit(data: CreateNotificationInput) {
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <PlusIcon className="size-3.5" />
            <span>New Notification</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <SheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            Send Notification
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Dispatch a targeted notification alert directly to a user account.
          </SheetDescription>
        </SheetHeader>

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
                <Field data-invalid={Boolean(errors.userId)}>
                  <FieldLabel htmlFor="notif-user-trigger" className="text-xs">
                    Target User <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Popover
                    open={userPickerOpen}
                    onOpenChange={setUserPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id="notif-user-trigger"
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={userPickerOpen}
                        className={cn(
                          "h-8 w-full justify-between text-xs font-normal",
                          !selectedUserId && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">
                          {selectedUser
                            ? [selectedUser.first_name, selectedUser.last_name]
                                .filter(Boolean)
                                .join(" ") ||
                              selectedUser.email ||
                              selectedUser.id
                            : "Select target user..."}
                        </span>
                        <ChevronsUpDownIcon className="ms-2 size-3.5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search user name or email..."
                          className="text-xs"
                        />
                        <CommandList>
                          <CommandEmpty className="p-3 text-center text-xs text-muted-foreground">
                            {users.length === 0
                              ? "No users found."
                              : "No matching user."}
                          </CommandEmpty>
                          <CommandGroup>
                            {users.map((u) => {
                              const fullName = [u.first_name, u.last_name]
                                .filter(Boolean)
                                .join(" ")
                              const isSelected = u.id === selectedUserId

                              return (
                                <CommandItem
                                  key={u.id}
                                  value={`${fullName} ${u.email ?? ""} ${u.id}`}
                                  onSelect={() => {
                                    setValue("userId", u.id, {
                                      shouldValidate: true,
                                    })
                                    setUserPickerOpen(false)
                                  }}
                                  className="flex cursor-pointer items-center justify-between text-xs"
                                >
                                  <div className="flex flex-col truncate">
                                    <span className="font-medium text-foreground">
                                      {fullName || "User Account"}
                                    </span>
                                    {u.email && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {u.email}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <CheckIcon className="ms-2 size-3.5 shrink-0 text-primary" />
                                  )}
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.userId && (
                    <p className="text-[11px] text-destructive">
                      {errors.userId.message}
                    </p>
                  )}
                </Field>

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
              form="notification-form-element"
              disabled={isSubmitting}
              className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-3.5" />
                  Sending...
                </>
              ) : (
                "Send Notification"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}