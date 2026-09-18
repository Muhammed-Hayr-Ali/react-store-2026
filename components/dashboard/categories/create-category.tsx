"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
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

// Standard Components
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

import Image from "next/image"
import { createCategory, createCategorySchema } from "@/lib/actions/categories"

// ============================================================================
// ✅ Form Schema: مخطط خاص بالنموذج فقط (منفصل عن مخطط قاعدة البيانات)
// هذا يحل مشكلة "unknown" نهائياً لأننا نتحكم بالأنواع مباشرة هنا
// ============================================================================

type FormValues = z.infer<typeof createCategorySchema>

// ============================================================================
// Helper: Auto-generate slug
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
// Main Component
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
    resolver: zodResolver(createCategorySchema),
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

  // نمرر form.control صراحةً لتجنب خطأ السياق (Context Error)
  const imageUrl =
    useWatch({
      control: form.control,
      name: "image_url",
      defaultValue: "",
    }) || ""

  const isValidImage = imageUrl?.startsWith("http") || false

  React.useEffect(() => {
    if (isOpen === "create") form.reset()
  }, [isOpen, form])

  async function onSubmit(data: FormValues) {
    const payload = {
      name: data.name,
      name_ar: data.name_ar === "" ? null : data.name_ar,
      slug: data.slug,
      description: data.description === "" ? null : data.description,
      parent_id: data.parent_id ?? null,
      is_active: data.is_active,
      sort_order: Number(data.sort_order),
      image_url: data.image_url === "" ? null : data.image_url,
      image_alt: data.image_alt === "" ? null : data.image_alt,
    }

    const result = await createCategory(payload)

    if (result.success) {
      if (result.data) onSuccess(result.data)
      toast.success("Category created successfully!")
      onOpenChange(false)
      form.reset()
      router.refresh()
    } else {
      const errorMsg =
        result.error === "VALIDATION_ERROR"
          ? "يرجى التحقق من صحة البيانات المدخلة."
          : result.error || "Failed to create category. Please try again."
      toast.error(errorMsg)
    }
  }

  return (
    <CustomSheet open={isOpen === "create"} onOpenChange={onOpenChange}>
      <CustomSheetContent
        showCloseButton={false}
        side={side}
        className="flex h-full max-h-dvh w-full flex-col p-0 sm:min-w-125"
      >
        {/* Header */}
        <CustomSheetHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <CustomSheetTitle className="text-base font-semibold">
            Add Category
          </CustomSheetTitle>
          <CustomSheetDescription className="mt-1 text-xs">
            Fill in the details below to add a new category to your store.
          </CustomSheetDescription>
        </CustomSheetHeader>

        {/* Scrollable Content */}
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
                          if (!form.getFieldState("slug").isDirty) {
                            form.setValue("slug", generateSlug(newName), {
                              shouldValidate: false,
                              shouldDirty: false,
                            })
                          }
                          if (!form.getFieldState("image_alt").isDirty) {
                            form.setValue("image_alt", newName, {
                              shouldValidate: false,
                              shouldDirty: false,
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
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name_ar">Arabic Name</FieldLabel>
                      <CustomInput
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
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
                      value={field.value ?? ""}
                      onChange={field.onChange}
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
                      value={field.value ?? ""}
                      onChange={field.onChange}
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
                      value={field.value ?? ""}
                      onChange={field.onChange}
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
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        id="sort_order"
                        type="number"
                        min="0"
                        aria-invalid={fieldState.invalid}
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
              <FieldError
                errors={[
                  { message: errors.root.message || "An error occurred" },
                ]}
              />
            )}
          </form>
        </div>

        {/* Footer */}
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
