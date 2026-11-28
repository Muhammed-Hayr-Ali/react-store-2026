"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  CalendarClockIcon,
  ImageIcon,
  LoaderCircleIcon,
  MegaphoneIcon,
  MousePointerClickIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import {
  createPromoBanner,
  updatePromoBanner,
} from "@/lib/actions/promo-banners"
import type {
  CreatePromoBannerValues,
  PromoBanner,
} from "@/lib/actions/promo-banners"
import { createPromoBannerSchema } from "@/lib/actions/promo-banners/schemas"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import { useIsMobile } from "@/hooks/use-mobile"

interface PromoBannerFormSheetProps {
  open: boolean
  banner: PromoBanner | null
  onOpenChange: (open: boolean) => void
  onSaved: (banner: PromoBanner) => void
  trigger?: React.ReactElement
}

interface PromoBannerFormState {
  title: string
  title_ar: string
  subtitle: string
  subtitle_ar: string
  badge_text: string
  badge_text_ar: string
  cta_label: string
  cta_label_ar: string
  cta_href: string
  image_url: string
  image_alt: string
  priority: number
  is_active: boolean
  starts_at: string
  ends_at: string
}

const emptyFormState: PromoBannerFormState = {
  title: "",
  title_ar: "",
  subtitle: "",
  subtitle_ar: "",
  badge_text: "",
  badge_text_ar: "",
  cta_label: "",
  cta_label_ar: "",
  cta_href: "",
  image_url: "",
  image_alt: "",
  priority: 0,
  is_active: true,
  starts_at: "",
  ends_at: "",
}

function toDateTimeLocal(value: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ""
  const pad = (part: number) => String(part).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function makeFormState(banner: PromoBanner | null): PromoBannerFormState {
  if (!banner) return emptyFormState

  return {
    title: banner.title,
    title_ar: banner.title_ar ?? "",
    subtitle: banner.subtitle ?? "",
    subtitle_ar: banner.subtitle_ar ?? "",
    badge_text: banner.badge_text ?? "",
    badge_text_ar: banner.badge_text_ar ?? "",
    cta_label: banner.cta_label ?? "",
    cta_label_ar: banner.cta_label_ar ?? "",
    cta_href: banner.cta_href ?? "",
    image_url: banner.image_url ?? "",
    image_alt: banner.image_alt ?? "",
    priority: banner.priority,
    is_active: banner.is_active,
    starts_at: toDateTimeLocal(banner.starts_at),
    ends_at: toDateTimeLocal(banner.ends_at),
  }
}

export function PromoBannerFormSheet({
  open,
  banner,
  onOpenChange,
  onSaved,
  trigger,
}: PromoBannerFormSheetProps) {
  const isMobile = useIsMobile()
  const t = useTranslations("PromoBannersManagement")
  const errorT = useTranslations("ActionErrors")
  const [isPending, startTransition] = React.useTransition()
  const form = useForm<
    import("@/lib/actions/promo-banners").CreatePromoBannerInput,
    unknown,
    CreatePromoBannerValues
  >({
    resolver: zodResolver(createPromoBannerSchema),
    mode: "onChange",
    defaultValues: emptyFormState,
  })
  const { control, reset, handleSubmit: handleFormSubmit } = form
  const values = useWatch({ control })
  const imagePreviewUrl = getSiteAssetUrl(values.image_url)
  const isEditing = Boolean(banner)

  React.useEffect(() => {
    if (open) reset(makeFormState(banner))
  }, [banner, open, reset])

  const handleSubmit = (formValues: CreatePromoBannerValues): void => {
    startTransition(async () => {
      const result =
        banner && isEditing
          ? await updatePromoBanner({ ...formValues, id: banner.id })
          : await createPromoBanner(formValues)

      if (!result.success) {
        toast.error(errorT(getActionErrorKey(result.error)))
        return
      }

      onSaved(result.data)
      onOpenChange(false)
      toast.success(
        isEditing ? t("UPDATE_SUCCESS") : t("CREATE_SUCCESS")
      )
    })
  }

  const textField = (
    name:
      | "title"
      | "title_ar"
      | "subtitle"
      | "subtitle_ar"
      | "badge_text"
      | "badge_text_ar"
      | "cta_label"
      | "cta_label_ar"
      | "cta_href"
      | "image_url"
      | "image_alt",
    label: string,
    placeholder: string,
    options: { dir?: "rtl" | "ltr"; multiline?: boolean } = {}
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`promo-banner-${name}`} className="text-xs">
            {label}
          </FieldLabel>
          {options.multiline ? (
            <Textarea
              {...field}
              value={field.value ?? ""}
              id={`promo-banner-${name}`}
              dir={options.dir}
              placeholder={placeholder}
              disabled={isPending}
              className="min-h-20 resize-y text-xs"
              aria-invalid={fieldState.invalid}
            />
          ) : (
            <Input
              {...field}
              value={field.value ?? ""}
              id={`promo-banner-${name}`}
              dir={options.dir}
              placeholder={placeholder}
              disabled={isPending}
              className="h-9 text-xs"
              aria-invalid={fieldState.invalid}
            />
          )}
          {fieldState.invalid && fieldState.error?.message && (
            <FieldError
              errors={[
                { ...fieldState.error, message: t(fieldState.error.message) },
              ]}
            />
          )}
        </Field>
      )}
    />
  )

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!isPending) onOpenChange(nextOpen)
      }}
    >
      <SheetTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm" className="h-8 gap-1.5 text-xs">
            <MegaphoneIcon className="size-3.5" />
            {t("CREATE_BANNER")}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="max-h-dvh gap-0 p-0 sm:max-w-xl data-[side=left]:sm:max-w-1/3 data-[side=right]:sm:max-w-2/5"
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4 pe-12 sm:px-6">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary">
              <MegaphoneIcon className="size-4 text-primary" />
            </span>
            {isEditing ? t("FORM_EDIT_TITLE") : t("FORM_CREATE_TITLE")}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {isEditing
              ? t("FORM_EDIT_DESCRIPTION")
              : t("FORM_CREATE_DESCRIPTION")}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.stopPropagation()
            void handleFormSubmit(handleSubmit)(event)
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <MegaphoneIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("CONTENT_SECTION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("CONTENT_DESCRIPTION")}
                  </p>
                </div>
              </div>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  {textField(
                    "title",
                    t("TITLE_EN_LABEL"),
                    t("TITLE_EN_PLACEHOLDER")
                  )}
                  {textField(
                    "title_ar",
                    t("TITLE_AR_LABEL"),
                    t("TITLE_AR_PLACEHOLDER"),
                    { dir: "rtl" }
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {textField(
                    "subtitle",
                    t("SUBTITLE_EN_LABEL"),
                    t("SUBTITLE_EN_PLACEHOLDER"),
                    { multiline: true }
                  )}
                  {textField(
                    "subtitle_ar",
                    t("SUBTITLE_AR_LABEL"),
                    t("SUBTITLE_AR_PLACEHOLDER"),
                    { dir: "rtl", multiline: true }
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {textField(
                    "badge_text",
                    t("BADGE_EN_LABEL"),
                    t("BADGE_EN_PLACEHOLDER")
                  )}
                  {textField(
                    "badge_text_ar",
                    t("BADGE_AR_LABEL"),
                    t("BADGE_AR_PLACEHOLDER"),
                    { dir: "rtl" }
                  )}
                </div>
              </FieldGroup>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <MousePointerClickIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("CTA_SECTION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("CTA_DESCRIPTION")}
                  </p>
                </div>
              </div>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  {textField(
                    "cta_label",
                    t("CTA_LABEL_EN"),
                    t("CTA_LABEL_EN_PLACEHOLDER")
                  )}
                  {textField(
                    "cta_label_ar",
                    t("CTA_LABEL_AR"),
                    t("CTA_LABEL_AR_PLACEHOLDER"),
                    { dir: "rtl" }
                  )}
                </div>
                {textField(
                  "cta_href",
                  t("CTA_HREF_LABEL"),
                  t("CTA_HREF_PLACEHOLDER"),
                  { dir: "ltr" }
                )}
              </FieldGroup>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <ImageIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("MEDIA_SECTION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("MEDIA_DESCRIPTION")}
                  </p>
                </div>
              </div>
              <FieldGroup>
                {imagePreviewUrl && (
                  <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                    <Avatar className="size-14 rounded-lg after:rounded-lg">
                      <AvatarImage
                        src={imagePreviewUrl}
                        alt={values.image_alt || values.title}
                        className="rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg bg-secondary">
                        <ImageIcon className="size-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      {t("IMAGE_PREVIEW_LABEL")}
                    </p>
                  </div>
                )}
                {textField(
                  "image_url",
                  t("IMAGE_URL_LABEL"),
                  t("IMAGE_URL_PLACEHOLDER"),
                  { dir: "ltr" }
                )}
                {textField(
                  "image_alt",
                  t("IMAGE_ALT_LABEL"),
                  t("IMAGE_ALT_PLACEHOLDER")
                )}
              </FieldGroup>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <CalendarClockIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("VISIBILITY_SECTION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("VISIBILITY_DESCRIPTION")}
                  </p>
                </div>
              </div>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="promo-banner-priority"
                          className="text-xs"
                        >
                          {t("PRIORITY_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="promo-banner-priority"
                          type="number"
                          step="1"
                          value={String(field.value ?? 0)}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(event.target.value)
                          }
                          disabled={isPending}
                          className="h-9 text-xs"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && fieldState.error?.message && (
                          <FieldError
                            errors={[
                              {
                                ...fieldState.error,
                                message: t(fieldState.error.message),
                              },
                            ]}
                          />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel
                          htmlFor="promo-banner-active"
                          className="mt-6 flex h-9 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border/60 px-3 text-xs"
                        >
                          {t("ACTIVE_LABEL")}
                          <Switch
                            id="promo-banner-active"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                          />
                        </FieldLabel>
                      </Field>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["starts_at", t("STARTS_AT_LABEL")],
                      ["ends_at", t("ENDS_AT_LABEL")],
                    ] as const
                  ).map(([name, label]) => (
                    <Controller
                      key={name}
                      name={name}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor={`promo-banner-${name}`}
                            className="text-xs"
                          >
                            {label}
                          </FieldLabel>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            id={`promo-banner-${name}`}
                            type="datetime-local"
                            disabled={isPending}
                            className="h-9 text-xs"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && fieldState.error?.message && (
                            <FieldError
                              errors={[
                                {
                                  ...fieldState.error,
                                  message: t(fieldState.error.message),
                                },
                              ]}
                            />
                          )}
                        </Field>
                      )}
                    />
                  ))}
                </div>
              </FieldGroup>
            </section>
          </div>

          <SheetFooter className="border-t border-border/60 px-5 py-4 sm:px-6">
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
              className="h-9 gap-1.5 text-xs"
            >
              {isPending && (
                <LoaderCircleIcon className="size-3.5 animate-spin" />
              )}
              {isPending ? t("SAVING_BUTTON") : t("SAVE_BUTTON")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
