"use client"

/**
 * @file components/dashboard/categories/category-form-sheet.tsx
 * @description Provides the create and edit form for storefront categories.
 */

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import slugify from "slugify"
import {
  Layers3Icon,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { createCategory, updateCategory } from "@/lib/actions/categories"
import type { Category } from "@/lib/actions/categories"
import {
  isValidCategoryImageUrl,
  type CategoryInput,
} from "@/lib/actions/categories/schemas"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import { getActionErrorKey } from "@/lib/actions/error-keys"

interface CategoryFormSheetProps {
  open: boolean
  category: Category | null
  categories: Category[]
  categoryImages: string[]
  onOpenChange: (open: boolean) => void
  onSaved: (category: Category) => void
  trigger?: React.ReactElement
}

interface CategoryFormState {
  name: string
  name_ar: string
  slug: string
  description: string
  description_ar: string
  parent_id: string
  image_url: string
  image_alt: string
  sort_order: string
  is_active: boolean
}

const emptyFormState: CategoryFormState = {
  name: "",
  name_ar: "",
  slug: "",
  description: "",
  description_ar: "",
  parent_id: "none",
  image_url: "",
  image_alt: "",
  sort_order: "0",
  is_active: true,
}

function makeFormState(category: Category | null): CategoryFormState {
  return {
    name: category?.name ?? "",
    name_ar: category?.name_ar ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    description_ar: category?.description_ar ?? "",
    parent_id: category?.parent_id ?? "none",
    image_url: category?.image_url ?? "",
    image_alt: category?.image_alt ?? "",
    sort_order: String(category?.sort_order ?? 0),
    is_active: category?.is_active ?? true,
  }
}

export function CategoryFormSheet({
  open,
  category,
  categories,
  categoryImages,
  onOpenChange,
  onSaved,
  trigger,
}: CategoryFormSheetProps) {
  const t = useTranslations("CategoriesManagement")
  const tErrors = useTranslations("ActionErrors")
  const [isPending, startTransition] = React.useTransition()
  const formSchema = React.useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, t("CATEGORY_NAME_REQUIRED_ERROR"))
          .max(255, t("CATEGORY_NAME_TOO_LONG_ERROR")),
        name_ar: z.string().trim().max(255, t("CATEGORY_NAME_TOO_LONG_ERROR")),
        slug: z
          .string()
          .trim()
          .min(1, t("CATEGORY_SLUG_REQUIRED_ERROR"))
          .max(255, t("CATEGORY_SLUG_TOO_LONG_ERROR")),
        description: z.string(),
        description_ar: z.string(),
        parent_id: z.string(),
        image_url: z
          .string()
          .trim()
          .max(508, t("INVALID_IMAGE_URL_ERROR"))
          .refine(
            (value) => !value || isValidCategoryImageUrl(value),
            t("INVALID_IMAGE_URL_ERROR")
          ),
        image_alt: z.string().max(255, t("CATEGORY_IMAGE_ALT_TOO_LONG_ERROR")),
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
  const form = useForm<CategoryFormState>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: emptyFormState,
  })
  const { control, reset, setValue, handleSubmit: handleFormSubmit } = form
  const values = useWatch({ control })
  const editedFields = React.useRef({ slug: false, imageAlt: false })
  const isEditing = Boolean(category)
  const imagePreviewUrl = getSiteAssetUrl(values.image_url)
  const imageOptions = React.useMemo(
    () =>
      categoryImages.map((filename) => ({
        filename,
        label: filename.replace(/\.[^.]+$/, "").replaceAll("-", " "),
        url: `/site-assets/categories/${encodeURIComponent(filename)}`,
      })),
    [categoryImages]
  )

  React.useEffect(() => {
    if (!open) return
    reset(makeFormState(category))
    editedFields.current = { slug: false, imageAlt: false }
  }, [category, open, reset])

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

  const allowedParents = categories.filter((candidate) => {
    if (!category) return true
    if (candidate.id === category.id) return false

    let current = candidate
    const visited = new Set<string>()
    while (current.parent_id && !visited.has(current.id)) {
      if (current.parent_id === category.id) return false
      visited.add(current.id)
      const parent = categories.find((item) => item.id === current.parent_id)
      if (!parent) break
      current = parent
    }

    return true
  })

  const handleSubmit = (formValues: CategoryFormState) => {
    const input: CategoryInput = {
      name: formValues.name,
      name_ar: formValues.name_ar || null,
      slug: formValues.slug,
      description: formValues.description.trim() || null,
      description_ar: formValues.description_ar.trim() || null,
      parent_id: formValues.parent_id === "none" ? null : formValues.parent_id,
      image_url: formValues.image_url || null,
      image_alt: formValues.image_alt || null,
      sort_order:
        formValues.sort_order.trim() === "" ? 0 : Number(formValues.sort_order),
      is_active: formValues.is_active,
    }

    startTransition(async () => {
      try {
        const result =
          category && isEditing
            ? await updateCategory({ ...input, id: category.id })
            : await createCategory(input)

        if (!result.success) {
          const message =
            result.error === "CATEGORY_SLUG_ALREADY_EXISTS"
              ? t("SLUG_ALREADY_EXISTS")
              : result.error === "INVALID_CATEGORY_PARENT" ||
                  result.error === "PARENT_CATEGORY_NOT_FOUND"
                ? t("INVALID_PARENT")
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
              {t("CREATE_CATEGORY")}
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
                        <FieldLabel htmlFor="category-name" className="text-xs">
                          {t("NAME_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="category-name"
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
                        <FieldLabel
                          htmlFor="category-name-ar"
                          className="text-xs"
                        >
                          {t("NAME_AR_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="category-name-ar"
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
                      <FieldLabel htmlFor="category-slug" className="text-xs">
                        {t("SLUG_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="category-slug"
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
                          htmlFor="category-description"
                          className="text-xs"
                        >
                          {t("DESCRIPTION_LABEL")}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="category-description"
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
                          htmlFor="category-description-ar"
                          className="text-xs"
                        >
                          {t("DESCRIPTION_AR_LABEL")}
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="category-description-ar"
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
              </FieldGroup>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <Layers3Icon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("HIERARCHY_SECTION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("HIERARCHY_DESCRIPTION")}
                  </p>
                </div>
              </div>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="parent_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="category-parent"
                          className="text-xs"
                        >
                          {t("PARENT_LABEL")}
                        </FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(value ?? "none")
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger
                            id="category-parent"
                            className="h-9 w-full text-xs"
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue
                              placeholder={t("PARENT_PLACEHOLDER")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              {t("NO_PARENT")}
                            </SelectItem>
                            {allowedParents.map((parent) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {parent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="sort_order"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="category-order"
                          className="text-xs"
                        >
                          {t("SORT_ORDER_LABEL")}
                        </FieldLabel>
                        <Input
                          {...field}
                          id="category-order"
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
                </div>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="category-active"
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 p-3 text-xs"
                      >
                        <Checkbox
                          id="category-active"
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
              </FieldGroup>
            </section>

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
                                <span className="absolute end-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
                      <FieldLabel
                        htmlFor="category-image-url"
                        className="text-xs"
                      >
                        {t("IMAGE_URL_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="category-image-url"
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
                      <FieldLabel
                        htmlFor="category-image-alt"
                        className="text-xs"
                      >
                        {t("IMAGE_ALT_LABEL")}
                      </FieldLabel>
                      <Input
                        {...field}
                        id="category-image-alt"
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
