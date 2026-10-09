"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import slugify from "slugify"
import {
  RadioTowerIcon,
  XIcon,
  AlertCircleIcon,
  HashIcon,
  Settings2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
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

import { createNotificationChannel } from "@/lib/actions/notifications"

const channelSchema = z.object({
  slug: z.string().min(2, "Slug must be at least 2 characters").max(50),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  name_ar: z.string().min(2, "Arabic name must be at least 2 characters").max(100),
  description: z.string().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  isMandatory: z.boolean(),
  defaultEnabled: z.boolean(),
})

type ChannelFormValues = z.infer<typeof channelSchema>

function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    replacement: "-",
    trim: true,
  })
}

interface ChannelFormSheetProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function ChannelFormSheet({
  trigger,
  onSuccess,
}: ChannelFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getFieldState,
    reset,
    formState: { isSubmitting },
  } = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    mode: "onChange",
    defaultValues: {
      slug: "",
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      isMandatory: false,
      defaultEnabled: true,
    },
  })

  const descValue = useWatch({ control, name: "description" }) || ""
  const descArValue = useWatch({ control, name: "description_ar" }) || ""

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setErrorMessage(null)
      reset()
    }
  }

  async function onSubmit(data: ChannelFormValues) {
    setErrorMessage(null)

    const payload = {
      ...data,
      description: data.description === "" ? null : data.description,
      description_ar: data.description_ar === "" ? null : data.description_ar,
    }

    const res = await createNotificationChannel(payload)

    if (res.success) {
      toast.success("Notification channel created successfully!")
      onSuccess?.()
      handleOpenChange(false)
    } else {
      setErrorMessage(
        res.error === "SLUG_ALREADY_EXISTS"
          ? "Slug is already in use."
          : res.error || "Failed to create notification channel."
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
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <RadioTowerIcon className="size-3.5" />
            <span>Add Channel</span>
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <SheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            Create Notification Channel
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Configure a topic channel for targeted notifications and user opt-in/opt-out preferences.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="channel-form-element"
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

            {/* تفاصيل القناة والأسماء والسلوج التلقائي */}
            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <HashIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Channel Details
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="channel-name-en" className="text-xs">
                          Name (EN) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="channel-name-en"
                          placeholder="e.g., Flash Sales"
                          className="h-8 text-xs"
                          onChange={(e) => {
                            const newName = e.target.value
                            field.onChange(newName)
                            if (!getFieldState("slug").isDirty) {
                              setValue("slug", generateSlug(newName), {
                                shouldValidate: true,
                              })
                            }
                          }}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="name_ar"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="channel-name-ar" className="text-xs">
                          Name (AR) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="channel-name-ar"
                          placeholder="مثال: عروض الفلاش"
                          dir="rtl"
                          className="h-8 text-xs"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="slug"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="channel-slug" className="text-xs">
                        Slug Identifier <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="channel-slug"
                        placeholder="flash-sales"
                        className="h-8 font-mono text-xs"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="channel-desc-en" className="text-xs">
                      Description (EN)
                    </FieldLabel>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {descValue.length}/200
                    </span>
                  </div>
                  <InputGroup className="bg-background">
                    <InputGroupTextarea
                      id="channel-desc-en"
                      placeholder="Short description of what notifications will be delivered..."
                      rows={2}
                      {...register("description")}
                      className="resize-y text-xs"
                    />
                  </InputGroup>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="channel-desc-ar" className="text-xs">
                      Description (AR)
                    </FieldLabel>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {descArValue.length}/200
                    </span>
                  </div>
                  <InputGroup className="bg-background">
                    <InputGroupTextarea
                      id="channel-desc-ar"
                      placeholder="وصف مختصر لنوع الإشعارات التي ستصل للمشتركين..."
                      dir="rtl"
                      rows={2}
                      {...register("description_ar")}
                      className="resize-y text-xs"
                    />
                  </InputGroup>
                </div>
              </FieldGroup>
            </div>

            {/* خيارات الاشتراك والسلوك الافتراضي */}
            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <Settings2Icon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Subscription Behavior
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5 pe-3">
                    <span className="text-xs font-medium text-foreground">
                      Default Enabled
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Automatically subscribe all new and existing users to this channel upon creation.
                    </p>
                  </div>
                  <Controller
                    name="defaultEnabled"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5 pe-3">
                    <span className="text-xs font-medium text-foreground">
                      Mandatory Channel
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Users cannot opt-out or unsubscribe from this channel (e.g. order tracking or security).
                    </p>
                  </div>
                  <Controller
                    name="isMandatory"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={(val) => {
                          field.onChange(val)
                          if (val) setValue("defaultEnabled", true)
                        }}
                      />
                    )}
                  />
                </div>
              </div>
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
              form="channel-form-element"
              disabled={isSubmitting}
              className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-3.5" />
                  Creating...
                </>
              ) : (
                "Save Channel"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}