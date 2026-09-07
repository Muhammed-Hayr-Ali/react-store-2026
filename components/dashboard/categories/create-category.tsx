"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLocale } from "next-intl"
import slugify from "slugify"
import { SparklesIcon, LinkIcon } from "lucide-react"

// Custom UI Components
import { CustomButton } from "@/components/ui/custom-button"
import { CustomInput } from "@/components/ui/custom-input"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

// Standard Components for specific fields
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Category } from "./categories-table"
import {
  CustomSheet,
  CustomSheetClose,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetFooter,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/ui/custom-sheet"

import { createCategory } from "@/lib/actions/categories/create-category"
import Image from "next/image"

// ============================================================================
// 1. Define the validation schema using Zod
// ============================================================================
const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters."),
  name_ar: z
    .string()
    .max(100, "Arabic name must be at most 100 characters.")
    .optional()
    .or(z.literal("")),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(100, "Slug must be at most 100 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and dashes only."
    ),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters.")
    .optional()
    .or(z.literal("")),
  parent_id: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z.number().min(0, "Sort order must be positive."),
  image_url: z
    .string()
    .url("Must be a valid URL.")
    .optional()
    .or(z.literal("")),
  image_alt: z
    .string()
    .max(200, "Alt text must be at most 200 characters.")
    .optional()
    .or(z.literal("")),
})

type FormValues = z.infer<typeof categorySchema>

// ============================================================================
// 2. Helper: Auto-generate slug
// ============================================================================
function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    replacement: "-",
    trim: true,
  })
}

// ============================================================================
// 3. Main Component
// ============================================================================
interface CreateCategorySheetProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  items: Category[] | null
  onSuccess: (newCategory: Category) => void
}

export function getSide({
  isMobile,
  locale,
}: {
  isMobile: boolean
  locale: string
}) {
  const dir = locale === "ar" ? "left" : "right"
  return isMobile ? "bottom" : dir
}

export default function CreateCategorySheet({
  isOpen,
  onOpenChange,
  items,
  onSuccess,
}: CreateCategorySheetProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const side = getSide({ isMobile, locale })

  const form = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      name_ar: "",
      slug: "",
      description: "",
      parent_id: null,
      is_active: true,
      sort_order: 0,
      image_url: "",
      image_alt: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  const { getValues } = form
  const imageUrl = getValues("image_url")
  const isValidImage = imageUrl && imageUrl.startsWith("http")

  React.useEffect(() => {
    if (isOpen === "create") form.reset()
  }, [isOpen, form])

  async function onSubmit(data: FormValues) {
    const payload = {
      name: data.name,
      name_ar: data.name_ar || null,
      slug: data.slug,
      description: data.description || null,
      parent_id: data.parent_id,
      is_active: data.is_active,
      sort_order: data.sort_order,
      image_url: data.image_url || null,
      image_alt: data.image_alt || null,
    }

    const result = await createCategory(payload)

    if (result.success) {
      if (result.data) onSuccess(result.data)
      toast.success("Category created successfully!")
      onOpenChange(false)
      form.reset()
      router.refresh()
    } else {
      toast.error(
        result.error || "Failed to create category. Please try again."
      )
    }
  }

  return (
    <CustomSheet open={isOpen === "create"} onOpenChange={onOpenChange}>
      {/* 
        ✅ التصحيح هنا: 
        1. استبدال h-dvh بـ h-full max-h-[100dvh] لتجنب مشاكل حساب الارتفاع في متصفحات الموبايل.
        2. استبدال min-w-1/2 بـ w-full للموبايل، و min-w-[500px] للشاشات الأكبر لضمان مظهر مناسب.
      */}
      <CustomSheetContent
        showCloseButton={false}
        side={side}
        className="flex h-full max-h-dvh w-full flex-col p-0 sm:min-w-125"
      >
        {/* Header ثابت */}
        <CustomSheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <CustomSheetTitle className="text-base font-semibold">
            Add New Category
          </CustomSheetTitle>
          <CustomSheetDescription className="mt-1 text-xs">
            Fill in the details below to add a new category to your store.
          </CustomSheetDescription>
        </CustomSheetHeader>

        {/* 
          ✅ منطقة السكرول: 
          تم تقليل الحشو الجانبي في الموبايل (px-4) لمنع أي تمرير أفقي عرضي 
          الذي قد يعطل التمرير العمودي في متصفحات الموبايل.
        */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <form
            id="create-category-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  1
                </span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">English Name *</FieldLabel>
                      <CustomInput
                        {...field}
                        id="name"
                        placeholder="e.g., Electronics"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => {
                          const newName = e.target.value
                          field.onChange(newName)
                          if (!form.getFieldState("slug").isDirty)
                            form.setValue("slug", generateSlug(newName), {
                              shouldValidate: false,
                              shouldDirty: false,
                            })
                          if (!form.getFieldState("image_alt").isDirty)
                            form.setValue("image_alt", newName, {
                              shouldValidate: false,
                              shouldDirty: false,
                            })
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
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name_ar">Arabic Name</FieldLabel>
                      <CustomInput
                        {...field}
                        id="name_ar"
                        placeholder="مثال: إلكترونيات"
                        dir="rtl"
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
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="slug"
                      className="flex items-center gap-1.5"
                    >
                      Slug *{" "}
                      <SparklesIcon className="size-3.5 text-amber-500" />
                    </FieldLabel>
                    <CustomInput
                      {...field}
                      id="slug"
                      placeholder="electronics"
                      className="font-mono text-sm"
                      aria-invalid={fieldState.invalid}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Auto-generated from English name. URL-friendly.
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Separator />

            {/* Section 2: Media & SEO */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  2
                </span>
                Media & SEO
              </h3>

              <Controller
                name="image_url"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="image_url">Image URL</FieldLabel>
                    {isValidImage && (
                      <div className="mb-2 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        <Image
                          width={400}
                          height={225}
                          src={imageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover object-center"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>
                    )}
                    <CustomInput
                      {...field}
                      id="image_url"
                      placeholder="https://example.com/image.jpg"
                      aria-invalid={fieldState.invalid}
                      prefixIcon={
                        <LinkIcon className="size-4 text-muted-foreground" />
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="image_alt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="image_alt"
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        Image Alt Text{" "}
                        <SparklesIcon className="size-3.5 text-amber-500" />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/200
                      </span>
                    </FieldLabel>
                    <CustomInput
                      {...field}
                      id="image_alt"
                      placeholder="e.g., Electronics category banner"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="description"
                      className="flex items-center justify-between"
                    >
                      <span>Description</span>
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/500
                      </span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Brief description for SEO and internal use..."
                      className="min-h-25 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Separator />

            {/* Section 3: Display Settings */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  3
                </span>
                Display Settings
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="parent_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="parent_id">
                        Parent Category
                      </FieldLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        value={field.value || "none"}
                      >
                        <SelectTrigger
                          id="parent_id"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Main Category)
                          </SelectItem>
                          {items?.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                              {item.name_ar && (
                                <span className="ms-1 text-muted-foreground">
                                  - {item.name_ar}
                                </span>
                              )}
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
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="sort_order">Sort Order</FieldLabel>
                      <CustomInput
                        {...field}
                        id="sort_order"
                        type="number"
                        min="0"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Lower numbers appear first.
                      </p>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="is_active"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex flex-row items-center justify-between rounded-lg border bg-muted/20 p-4"
                  >
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor="is_active" className="text-base">
                        Active Status
                      </FieldLabel>
                      <p className="text-xs text-muted-foreground">
                        Category will be visible to customers immediately.
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                )}
              />
            </div>

            {errors.root && (
              <FieldError errors={[{ message: errors.root.message }]} />
            )}
          </form>
        </div>

        {/* Footer ثابت */}
        <CustomSheetFooter className="shrink-0 border-t bg-background px-4 py-4 sm:px-6">
          <CustomSheetClose asChild>
            <CustomButton
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="tracking-wide uppercase"
            >
              Cancel
            </CustomButton>
          </CustomSheetClose>
          <CustomButton
            type="submit"
            form="create-category-form"
            disabled={isSubmitting}
            className="min-w-35 tracking-wide uppercase"
          >
            {isSubmitting ? <Spinner className="me-2" /> : "Create Category"}
          </CustomButton>
        </CustomSheetFooter>
      </CustomSheetContent>
    </CustomSheet>
  )
}
