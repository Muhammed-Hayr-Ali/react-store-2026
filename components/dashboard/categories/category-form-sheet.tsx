"use client"

/**
 * @file components/dashboard/categories/category-form-sheet.tsx
 * @description Uncontrolled slide-over sheet containing the Category creation and editing form.
 * React 19 / React Compiler compliant, strictly typed (Zero Any), and RTL-first.
 */

import * as React from "react"
import { useForm, Controller, useWatch, type Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { z } from "zod"
import {
  Wand2Icon,
  AlertCircleIcon,
  XIcon,
  PlusIcon,
  PencilIcon,
} from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createCategorySchema } from "@/lib/actions/categories/schemas"
import { createCategory, updateCategory } from "@/lib/actions/categories"
import type {
  Category,
  CategorySelectorItem,
} from "@/lib/actions/categories/types"

export const categoryFormSchema = createCategorySchema.extend({
  is_active: z.boolean(),
  sort_order: z
    .number()
    .int("SORT_ORDER_MUST_BE_INTEGER")
    .min(0, "SORT_ORDER_MUST_BE_POSITIVE"),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormSheetProps {
  category?: Category
  parentOptions?: CategorySelectorItem[]
  children?: React.ReactNode
  onSuccess?: () => void
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+\$/g, "")
}

export function CategoryFormSheet({
  category,
  parentOptions = [],
  children,
  onSuccess,
}: CategoryFormSheetProps) {
  const t = useTranslations("CategoriesManagement")
  const isEditing = Boolean(category)

  const [isPending, startTransition] = React.useTransition()
  const [serverError, setServerError] = React.useState<string | null>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)

  const { control, handleSubmit, reset, setValue, getFieldState, setError } =
    useForm<CategoryFormValues>({
      resolver: zodResolver(categoryFormSchema),
      defaultValues: {
        name: category?.name ?? "",
        name_ar: category?.name_ar ?? "",
        slug: category?.slug ?? "",
        parent_id: category?.parent_id ?? null,
        description: category?.description ?? "",
        image_url: category?.image_url ?? "",
        image_alt: category?.image_alt ?? "",
        is_active: category?.is_active ?? true,
        sort_order: category?.sort_order ?? 0,
      },
    })

  // React 19 Compiler-compliant isolated hook subscription
  const nameValue = useWatch({ control, name: "name" })

  // Reset form when opening or changing category
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setServerError(null)
      reset({
        name: category?.name ?? "",
        name_ar: category?.name_ar ?? "",
        slug: category?.slug ?? "",
        parent_id: category?.parent_id ?? null,
        description: category?.description ?? "",
        image_url: category?.image_url ?? "",
        image_alt: category?.image_alt ?? "",
        is_active: category?.is_active ?? true,
        sort_order: category?.sort_order ?? 0,
      })
    }
  }

  // Magic Wand: Generate Alt Text dynamically
  const handleGenerateAltText = () => {
    if (!nameValue?.trim()) return
    setValue("image_alt", `${nameValue.trim()} category showcase banner`, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const onSubmit = (values: CategoryFormValues) => {
    setServerError(null)

    startTransition(async () => {
      const res =
        isEditing && category
          ? await updateCategory(category.id, values)
          : await createCategory(values)

      if (res.success) {
        toast.success(
          isEditing
            ? t("CATEGORY_UPDATED_SUCCESS")
            : t("CATEGORY_CREATED_SUCCESS")
        )
        onSuccess?.()
        closeRef.current?.click() // Programmatic uncontrolled dismissal
      } else {
        if (res.details) {
          Object.entries(res.details).forEach(([field, msgs]) => {
            setError(field as Path<CategoryFormValues>, {
              message: msgs[0],
            })
          })
        }
        setServerError(res.error || t("GENERIC_ERROR"))
      }
    })
  }

  // ✅ React 19 Compiler Fix: Event handler isolates handleSubmit from render execution
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void handleSubmit(onSubmit)(e)
  }

  // Filter out self from parent options to prevent circular hierarchy
  const availableParents = parentOptions.filter(
    (item) => !isEditing || item.id !== category?.id
  )

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children ?? (
          <Button
            size="sm"
            variant={isEditing ? "ghost" : "default"}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            {isEditing ? (
              <>
                <PencilIcon className="size-3.5" />
                <span>{t("EDIT_CATEGORY")}</span>
              </>
            ) : (
              <>
                <PlusIcon className="size-3.5" />
                <span>{t("ADD_CATEGORY")}</span>
              </>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
        onInteractOutside={(e) => {
          if (isPending) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault()
        }}
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4 text-start">
          <SheetTitle className="text-base font-semibold">
            {isEditing ? t("EDIT_CATEGORY_TITLE") : t("ADD_CATEGORY_TITLE")}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {isEditing
              ? t("EDIT_CATEGORY_DESCRIPTION")
              : t("ADD_CATEGORY_DESCRIPTION")}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form
            id="category-form-sheet-el"
            onSubmit={handleFormSubmit}
            className="space-y-4"
          >
            {/* Server Error Alert */}
            {serverError && (
              <Alert variant="destructive" className="relative pe-9">
                <AlertCircleIcon className="size-4 shrink-0" />
                <AlertTitle className="text-xs font-semibold">
                  {t("ERROR_ALERT_TITLE")}
                </AlertTitle>
                <AlertDescription className="text-xs">
                  {serverError}
                </AlertDescription>
                <button
                  type="button"
                  onClick={() => setServerError(null)}
                  className="absolute inset-e-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">{t("DISMISS_ALERT_SR")}</span>
                </button>
              </Alert>
            )}

            {/* English / Primary Name */}
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    {t("NAME_LABEL")}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...field}
                    className="h-8 text-xs"
                    placeholder="e.g. Fresh Dairy"
                    onChange={(e) => {
                      field.onChange(e)
                      const slugState = getFieldState("slug")
                      if (!slugState.isDirty && !isEditing) {
                        setValue("slug", generateSlug(e.target.value), {
                          shouldValidate: true,
                        })
                      }
                    }}
                  />
                  {fieldState.error && (
                    <p className="text-[11px] text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Arabic Name */}
            <Controller
              control={control}
              name="name_ar"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    {t("NAME_AR_LABEL")}
                  </label>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    className="h-8 text-start text-xs"
                    placeholder="مثال: ألبان وأجبان طازجة"
                  />
                  {fieldState.error && (
                    <p className="text-[11px] text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* URL Slug with dirty sync guard */}
            <Controller
              control={control}
              name="slug"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    {t("SLUG_LABEL")}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    {...field}
                    className="h-8 font-mono text-xs"
                    placeholder="fresh-dairy"
                  />
                  {fieldState.error && (
                    <p className="text-[11px] text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Parent Category Selector */}
            <Controller
              control={control}
              name="parent_id"
              render={({ field }) => (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    {t("PARENT_CATEGORY_LABEL")}
                  </label>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(val) =>
                      field.onChange(val === "none" ? null : val)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue
                        placeholder={t("SELECT_PARENT_PLACEHOLDER")}
                      />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="none">
                        {t("NO_PARENT_ROOT_CATEGORY")}
                      </SelectItem>
                      {availableParents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.name}{" "}
                          {parent.name_ar ? `(${parent.name_ar})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">
                      {t("DESCRIPTION_LABEL")}
                    </label>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {(field.value ?? "").length}/500
                    </span>
                  </div>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={3}
                    className="resize-none text-xs"
                    placeholder={t("DESCRIPTION_PLACEHOLDER")}
                  />
                  {fieldState.error && (
                    <p className="text-[11px] text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Image URL */}
            <Controller
              control={control}
              name="image_url"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    {t("IMAGE_URL_LABEL")}
                  </label>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    className="h-8 font-mono text-xs"
                    placeholder="https://example.com/category.jpg"
                  />
                  {fieldState.error && (
                    <p className="text-[11px] text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Image Alt Text with Magic Wand Button */}
            <Controller
              control={control}
              name="image_alt"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    {t("IMAGE_ALT_LABEL")}
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      className="h-8 pe-8 text-xs"
                      placeholder="e.g. Fresh Dairy Banner"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleGenerateAltText}
                      title={t("GENERATE_ALT_TOOLTIP")}
                      className="absolute inset-e-1 size-6 cursor-pointer text-muted-foreground hover:text-primary"
                    >
                      <Wand2Icon className="size-3.5" />
                    </Button>
                  </div>
                  {fieldState.error && (
                    <p className="text-[11px] text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Sort Order & Active Toggle Grid */}
            <div className="grid grid-cols-2 items-center gap-3 rounded-lg border border-border bg-muted/10 p-3">
              <Controller
                control={control}
                name="sort_order"
                render={({ field }) => (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-foreground">
                      {t("SORT_ORDER_LABEL")}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 text-xs"
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                )}
              />

              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <div className="flex flex-col items-start space-y-1.5">
                    <label className="text-[11px] font-medium text-foreground">
                      {t("ACTIVE_STATUS_LABEL")}
                    </label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {field.value
                          ? t("STATUS_ACTIVE")
                          : t("STATUS_INACTIVE")}
                      </span>
                    </div>
                  </div>
                )}
              />
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <SheetFooter className="gap-2 border-t border-border/60 p-4 sm:gap-0">
          <SheetClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-xs"
            >
              {t("DISCARD_BUTTON")}
            </Button>
          </SheetClose>

          <Button
            type="submit"
            form="category-form-sheet-el"
            size="sm"
            disabled={isPending}
            className="text-xs"
          >
            {isPending && <Spinner className="me-1.5 size-3.5" />}
            {isEditing ? t("SAVE_CHANGES") : t("CREATE_BUTTON")}
          </Button>

          {/* Programmatic uncontrolled close ref */}
          <SheetClose ref={closeRef} className="hidden" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export { CategoryFormSheet as CategorySheet }
