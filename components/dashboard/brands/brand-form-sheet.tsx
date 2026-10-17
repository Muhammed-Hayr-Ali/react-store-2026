"use client"

/**
 * @file components/dashboard/brands/brand-form-sheet.tsx
 * @description Provides the create and edit form for storefront brands.
 */

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import slugify from "slugify"
import {
  LoaderCircleIcon,
  PackageOpenIcon,
  CheckIcon,
  TagsIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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
import { Textarea } from "@/components/ui/textarea"
import { createBrand, updateBrand } from "@/lib/actions/brands"
import type { BrandRecord } from "@/lib/actions/brands/types"
import type { BrandFormValues as BrandInput } from "@/lib/actions/brands/schemas"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import { getActionErrorKey } from "@/lib/actions/error-keys"

interface BrandFormSheetProps {
  open: boolean
  brand: BrandRecord | null
  brandImages: string[]
  onOpenChange: (open: boolean) => void
  onSaved: (brand: BrandRecord) => void
  trigger?: React.ReactElement
}

interface BrandFormState {
  name: string
  name_ar: string
  slug: string
  description: string
  description_ar: string
  image_url: string
  image_alt: string
  sort_order: string
  is_active: boolean
}

const emptyFormState: BrandFormState = {
  name: "",
  name_ar: "",
  slug: "",
  description: "",
  description_ar: "",
  image_url: "",
  image_alt: "",
  sort_order: "0",
  is_active: true,
}

function makeFormState(brand: BrandRecord | null): BrandFormState {
  return {
    name: brand?.name ?? "",
    name_ar: brand?.name_ar ?? "",
    slug: brand?.slug ?? "",
    description: brand?.description ?? "",
    description_ar: brand?.description_ar ?? "",
    image_url: brand?.image_url ?? "",
    image_alt: brand?.image_alt ?? "",
    sort_order: String(brand?.sort_order ?? 0),
    is_active: brand?.is_active ?? true,
  }
}

export function BrandFormSheet({
  open,
  brand,
  brandImages,
  onOpenChange,
  onSaved,
  trigger,
}: BrandFormSheetProps) {
  const t = useTranslations("BrandsManagement")
  const tErrors = useTranslations("ActionErrors")
  const [isPending, startTransition] = React.useTransition()

  // نستخدم useMemo لدعم الترجمة الديناميكية لأخطاء Zod
  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, t("BRAND_NAME_REQUIRED_ERROR"))
          .max(255, t("BRAND_NAME_TOO_LONG_ERROR")),
        name_ar: z.string().trim().max(255, t("BRAND_NAME_TOO_LONG_ERROR")),
        slug: z
          .string()
          .trim()
          .min(1, t("BRAND_SLUG_REQUIRED_ERROR"))
          .max(255, t("BRAND_SLUG_TOO_LONG_ERROR"))
          .regex(
            /^[a-z0-9-]+$/,
            "Slug must be lowercase alphanumeric with hyphens"
          ),
        description: z.string(),
        description_ar: z.string(),
        image_url: z.string().trim().max(508, t("INVALID_IMAGE_URL_ERROR")),
        image_alt: z.string().max(255, t("BRAND_IMAGE_ALT_TOO_LONG_ERROR")),
        sort_order: z
          .string()
          .refine(
            (value) => value.trim() === "" || Number.isInteger(Number(value)),
            t("INVALID_SORT_ORDER_ERROR")
          ),
        is_active: z.boolean(),
      }),
    [t]
  )

  const form = useForm<BrandFormState>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: emptyFormState,
  })

  const { control, reset, setValue, handleSubmit: handleFormSubmit } = form
  const values = useWatch({ control })
  const editedFields = React.useRef({ slug: false, imageAlt: false })
  const isEditing = Boolean(brand)
  const imagePreviewUrl = getSiteAssetUrl(values.image_url)
  const imageOptions = React.useMemo(
    () =>
      brandImages.map((filename) => ({
        filename,
        label: filename.replace(/\.[^.]+\$/, "").replaceAll("-", " "),
        url: `/site-assets/brands/${encodeURIComponent(filename)}`,
      })),
    [brandImages]
  )

  React.useEffect(() => {
    if (!open) return
    reset(makeFormState(brand))
    editedFields.current = { slug: false, imageAlt: false }
  }, [brand, open, reset])

  const handleNameChange = (name: string) => {
    const generatedValue = slugify(name, { lower: true, strict: true })
    setValue("name", name, { shouldValidate: true, shouldDirty: true })

    if (!editedFields.current.slug) {
      setValue("slug", generatedValue, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
    if (!editedFields.current.imageAlt) {
      setValue("image_alt", generatedValue, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  const handleSubmit = (formValues: BrandFormState) => {
    const input: BrandInput = {
      name: formValues.name,
      name_ar: formValues.name_ar || null,
      slug: formValues.slug,
      description: formValues.description.trim() || null,
      description_ar: formValues.description_ar.trim() || null,
      image_url: formValues.image_url || null,
      image_alt: formValues.image_alt || null,
      sort_order:
        formValues.sort_order.trim() === "" ? 0 : Number(formValues.sort_order),
      is_active: formValues.is_active,
      meta_title: brand?.meta_title ?? null,
      meta_description: brand?.meta_description ?? null,
    }

    startTransition(async () => {
      try {
        const result =
          brand && isEditing
            ? await updateBrand({ ...input, id: brand.id })
            : await createBrand(input)

        if (!result.success) {
          const message =
            result.error === "BRAND_SLUG_ALREADY_EXISTS"
              ? t("SLUG_ALREADY_EXISTS")
              : result.error
                ? tErrors(getActionErrorKey(result.error))
                : t("SAVE_ERROR")
          toast.error(message)
          return
        }

        onSaved(result.data)
        onOpenChange(false)
        toast.success(t(isEditing ? "UPDATE_SUCCESS" : "CREATE_SUCCESS"))
      } catch {
        toast.error(t("SAVE_ERROR"))
      }
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) onOpenChange(nextOpen)
      }}
    >
      <SheetTrigger
        render={
          trigger ?? (
            <Button type="button" size="sm" className="h-8 gap-1.5 text-xs">
              <TagsIcon className="size-3.5" />
              {t("CREATE_BRAND")}
            </Button>
          )
        }
      />
      <SheetContent
        side="right"
        className="gap-0 p-0 sm:max-w-xl"
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4 pe-12 sm:px-6">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary">
              <TagsIcon className="size-4 text-primary" />
            </span>
            {t(isEditing ? "FORM_EDIT_TITLE" : "FORM_CREATE_TITLE")}
          </SheetTitle>
          <SheetDescription>
            {t(isEditing ? "FORM_EDIT_DESCRIPTION" : "FORM_CREATE_DESCRIPTION")}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleFormSubmit(handleSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {/* قسم التفاصيل */}
            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <PackageOpenIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("DETAILS_SECTION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("DETAILS_DESCRIPTION")}
                  </p>
                </div>
              </div>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="brand-name" className="text-xs">
                          {t("NAME_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="brand-name"
                          onChange={(event) =>
                            handleNameChange(event.target.value)
                          }
                          placeholder={t("NAME_PLACEHOLDER")}
                          maxLength={255}
                          disabled={isPending}
                          className="h-9 text-xs"
                          aria-invalid={fieldState.invalid}
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
                        <FieldLabel htmlFor="brand-name-ar" className="text-xs">
                          {t("NAME_AR_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="brand-name-ar"
                          dir="rtl"
                          placeholder={t("NAME_AR_PLACEHOLDER")}
                          maxLength={255}
                          disabled={isPending}
                          className="h-9 text-xs"
                          aria-invalid={fieldState.invalid}
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
                      <FieldLabel htmlFor="brand-slug" className="text-xs">
                        {t("SLUG_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="brand-slug"
                        dir="ltr"
                        onChange={(event) => {
                          editedFields.current.slug = true
                          field.onChange(event)
                        }}
                        placeholder={t("SLUG_PLACEHOLDER")}
                        maxLength={255}
                        disabled={isPending}
                        className="h-9 text-xs"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="brand-description"
                          className="text-xs"
                        >
                          {t("DESCRIPTION_LABEL")}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="brand-description"
                          placeholder={t("DESCRIPTION_PLACEHOLDER")}
                          disabled={isPending}
                          className="min-h-20 resize-y text-xs"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="description_ar"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="brand-description-ar"
                          className="text-xs"
                        >
                          {t("DESCRIPTION_AR_LABEL")}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="brand-description-ar"
                          dir="rtl"
                          placeholder={t("DESCRIPTION_AR_PLACEHOLDER")}
                          disabled={isPending}
                          className="min-h-20 resize-y text-xs"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="sort_order"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="brand-order" className="text-xs">
                          {t("SORT_ORDER_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="brand-order"
                          type="number"
                          step="1"
                          placeholder={t("SORT_ORDER_PLACEHOLDER")}
                          disabled={isPending}
                          className="h-9 text-xs"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="brand-active"
                          className="mt-6 flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border/60 px-3 text-xs"
                        >
                          <Checkbox
                            id="brand-active"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                            disabled={isPending}
                          />
                          {t("ACTIVE_LABEL")}
                        </FieldLabel>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>
            </section>

            {/* قسم الصور (يستخدم الـ Accordion الفخم كما في Categories) */}
            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 border-b border-border/60 pb-3">
                <h2 className="text-sm font-semibold text-card-foreground">
                  {t("IMAGE_SECTION")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("IMAGE_DESCRIPTION")}
                </p>
              </div>
              <FieldGroup>
                <Accordion type="single" collapsible>
                  <AccordionItem value="image-library">
                    <AccordionTrigger className="items-center gap-2 px-3 py-2.5 text-muted-foreground hover:no-underline">
                      <span className="flex items-center gap-2">
                        <TagsIcon className="size-3.5 shrink-0 text-primary" />
                        {t("IMAGE_DESCRIPTION")}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                        {imageOptions.map((image) => {
                          const isSelected = values.image_url === image.url

                          return (
                            <Button
                              key={image.filename}
                              type="button"
                              variant="outline"
                              aria-label={image.label}
                              aria-pressed={isSelected}
                              disabled={isPending}
                              onClick={() =>
                                setValue("image_url", image.url, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                })
                              }
                              className={`relative h-auto w-full p-1 ${
                                isSelected
                                  ? "border-primary ring-2 ring-primary/20"
                                  : ""
                              }`}
                            >
                              <span className="relative block aspect-square w-full overflow-hidden rounded-md">
                                <Avatar className="absolute inset-0 size-full rounded-md after:rounded-md">
                                  <AvatarImage
                                    src={image.url}
                                    alt={image.label}
                                    className="rounded-md"
                                  />
                                  <AvatarFallback className="rounded-md bg-secondary">
                                    <TagsIcon className="size-4 text-primary" />
                                  </AvatarFallback>
                                </Avatar>
                              </span>
                              {isSelected && (
                                <span className="absolute inset-e-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                  <CheckIcon className="size-3" />
                                </span>
                              )}
                            </Button>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {imagePreviewUrl && (
                  <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                    <Avatar className="size-14 rounded-lg after:rounded-lg">
                      <AvatarImage
                        src={imagePreviewUrl}
                        alt={values.image_alt || values.name}
                        className="rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg bg-secondary">
                        <TagsIcon className="size-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      {t("IMAGE_PREVIEW_LABEL")}
                    </p>
                  </div>
                )}
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="brand-image-url" className="text-xs">
                        {t("IMAGE_URL_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="brand-image-url"
                        dir="ltr"
                        placeholder={t("IMAGE_URL_PLACEHOLDER")}
                        disabled={isPending}
                        className="h-9 text-xs"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="image_alt"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="brand-image-alt" className="text-xs">
                        {t("IMAGE_ALT_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="brand-image-alt"
                        onChange={(event) => {
                          editedFields.current.imageAlt = true
                          field.onChange(event)
                        }}
                        placeholder={t("IMAGE_ALT_PLACEHOLDER")}
                        maxLength={255}
                        disabled={isPending}
                        className="h-9 text-xs"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </section>
          </div>

          <SheetFooter className="flex-row justify-end border-t border-border/60 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-9 text-xs"
            >
              {t("CANCEL_BUTTON")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
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
