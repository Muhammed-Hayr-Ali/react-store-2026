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
import {
  PackageIcon,
  ImageIcon,
  FolderTreeIcon,
  CheckCircle2Icon,
  XIcon,
  Wand2Icon,
  AlertCircleIcon,
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

import {
  Category,
  updateCategory,
  updateCategorySchema,
} from "@/lib/actions/categories"

type FormValues = z.infer<typeof updateCategorySchema>

function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    replacement: "-",
    trim: true,
  })
}

interface UpdateCategorySheetProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  item: Category | null
  items: Category[] | null
  onSuccess: (updatedCategory: Category) => void
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

export default function UpdateCategorySheet({
  isOpen,
  onOpenChange,
  item,
  items,
  onSuccess,
}: UpdateCategorySheetProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const side = getSide({ isMobile, locale })
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // مزامنة قيم النموذج مباشرة عبر values لتفادي setState داخل Effect
  const form = useForm<FormValues>({
    resolver: zodResolver(updateCategorySchema),
    mode: "onChange",
    values: {
      name: item?.name || "",
      name_ar: item?.name_ar || "",
      slug: item?.slug || "",
      description: item?.description || "",
      parent_id: item?.parent_id ?? null,
      is_active: item?.is_active ?? true,
      sort_order: item?.sort_order ?? 0,
      image_url: item?.image_url || "",
      image_alt: item?.image_alt || "",
    },
  })

  const {
    formState: { isSubmitting },
    control,
    setValue,
    getFieldState,
  } = form

  const imageUrl = useWatch({ control, name: "image_url" }) || ""
  const nameValue = useWatch({ control, name: "name" }) || ""
  const descriptionValue = useWatch({ control, name: "description" }) || ""
  const isValidImage =
    imageUrl.startsWith("http://") || imageUrl.startsWith("https://")

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(null)
    }
    onOpenChange(open)
  }

  const handleGenerateAltText = () => {
    if (!nameValue.trim()) {
      setErrorMessage("Please enter the English name first")
      return
    }
    setErrorMessage(null)
    const generatedAlt = `${nameValue.trim()} category showcase banner`.slice(
      0,
      200
    )
    setValue("image_alt", generatedAlt, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  async function onSubmit(data: FormValues) {
    if (!item) {
      setErrorMessage("No category selected for update.")
      return
    }

    setErrorMessage(null)

    const payload = {
      name: data.name,
      name_ar: data.name_ar === "" ? null : data.name_ar,
      slug: data.slug,
      description: data.description === "" ? null : data.description,
      parent_id: data.parent_id,
      is_active: data.is_active,
      sort_order: Number(data.sort_order),
      image_url: data.image_url === "" ? null : data.image_url,
      image_alt: data.image_alt === "" ? null : data.image_alt,
    }

    const result = await updateCategory(item.id, payload)

    if (result.success) {
      if (result.data) onSuccess(result.data)
      toast.success("Category updated successfully!")
      handleOpenChange(false)
      router.refresh()
    } else {
      setErrorMessage(
        result.error || "Failed to update category. Please try again."
      )
    }
  }

  return (
    <CustomSheet open={isOpen === "update"} onOpenChange={handleOpenChange}>
      <CustomSheetContent
        showCloseButton={false}
        side={side}
        className="flex w-full flex-col p-0 sm:max-w-xl"
      >
        {/* Header - ثابت ومعزز بمسافة آمنة علوية */}
        <CustomSheetHeader className="shrink-0 border-b bg-card px-5 py-4 pt-safe sm:px-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CustomSheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Edit Category
              </CustomSheetTitle>
              <CustomSheetDescription className="text-xs text-muted-foreground">
                Modify category hierarchy, details, media, and status.
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

        {/* Scrollable Form Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="update-category-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pb-8"
          >
            {/* Global Error Alert */}
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

            {/* Card 1: Basic Information */}
            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <PackageIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Basic Information
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="edit-cat-name" className="text-xs">
                          Category Name (EN){" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="edit-cat-name"
                          placeholder="e.g., Electronics"
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
                        <FieldLabel
                          htmlFor="edit-cat-name-ar"
                          className="text-xs"
                        >
                          Category Name (AR)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="edit-cat-name-ar"
                          value={field.value ?? ""}
                          placeholder="e.g., إلكترونيات"
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
                      <FieldLabel htmlFor="edit-cat-slug" className="text-xs">
                        URL Slug <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-cat-slug"
                        placeholder="electronics"
                        className="h-8 font-mono text-xs"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {/* Card 2: Media & Description */}
            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <ImageIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Media & Description
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-cat-image" className="text-xs">
                        Category Banner / Icon URL
                      </FieldLabel>

                      {isValidImage && (
                        <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg border bg-muted/20">
                          <img
                            src={imageUrl}
                            alt="Category Banner Preview"
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                      )}

                      <Input
                        {...field}
                        id="edit-cat-image"
                        value={field.value ?? ""}
                        placeholder="https://example.com/category-banner.jpg"
                        className="h-8 text-xs"
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
                        htmlFor="edit-cat-image-alt"
                        className="text-xs"
                      >
                        Image Alt Text
                      </FieldLabel>

                      <div className="relative flex items-center">
                        <Input
                          {...field}
                          id="edit-cat-image-alt"
                          value={field.value ?? ""}
                          placeholder="e.g., Electronics department showcase banner"
                          className="h-8 pe-8 text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleGenerateAltText}
                          title="Generate Alt Text"
                          className="absolute inset-e-1 size-6 cursor-pointer text-muted-foreground hover:text-primary"
                        >
                          <Wand2Icon className="size-3.5" />
                        </Button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel
                          htmlFor="edit-cat-description"
                          className="text-xs"
                        >
                          Description
                        </FieldLabel>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {descriptionValue.length}/500
                        </span>
                      </div>
                      <InputGroup className="bg-background">
                        <InputGroupTextarea
                          {...field}
                          id="edit-cat-description"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? e.target.value : null
                            )
                          }
                          placeholder="Brief description for SEO and catalog navigation..."
                          rows={3}
                          className="resize-y text-xs"
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {/* Card 3: Hierarchy & Status */}
            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <FolderTreeIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Organization & Status
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="parent_id"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="edit-cat-parent"
                          className="text-xs"
                        >
                          Parent Category
                        </FieldLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "none" ? null : value)
                          }
                          value={field.value || "none"}
                        >
                          <SelectTrigger
                            id="edit-cat-parent"
                            className="h-8 text-xs"
                          >
                            <SelectValue placeholder="Select a parent category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-xs">
                              None (Root Category)
                            </SelectItem>
                            {items?.map(
                              (cat) =>
                                cat.id !== item?.id && (
                                  <SelectItem
                                    key={cat.id}
                                    value={cat.id}
                                    className="text-xs"
                                  >
                                    {cat.name}
                                    {cat.name_ar && (
                                      <span className="ms-1.5 text-muted-foreground">
                                        ({cat.name_ar})
                                      </span>
                                    )}
                                  </SelectItem>
                                )
                            )}
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
                        <FieldLabel htmlFor="edit-cat-sort" className="text-xs">
                          Sort Order
                        </FieldLabel>
                        <Input
                          {...field}
                          id="edit-cat-sort"
                          type="number"
                          min="0"
                          value={field.value ?? 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border bg-muted/15 p-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold">
                          Active Status
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Category and its products will be visible to shoppers.
                        </p>
                      </div>
                      <Switch
                        id="edit-cat-status"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </FieldGroup>
            </div>
          </form>
        </div>

        {/* Footer - موحد */}
        <CustomSheetFooter className="shrink-0 border-t bg-card px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex w-full flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <CustomSheetClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full cursor-pointer sm:w-auto"
              >
                Discard
              </Button>
            </CustomSheetClose>
            <Button
              type="submit"
              form="update-category-form"
              disabled={isSubmitting}
              className="w-full cursor-pointer shadow-xs sm:w-auto sm:min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="mr-1.5 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CustomSheetFooter>
      </CustomSheetContent>
    </CustomSheet>
  )
}
