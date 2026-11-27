/**
 * @file components/dashboard/product/product-form.tsx
 * @description Form component for creating and updating products, variants, and media with strict typing (No Any) and bilingual support (name_ar).
 */

"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Controller,
  useForm,
  useFieldArray,
  Control,
  useWatch,
  UseFormSetValue,
  UseFormGetValues,
  UseFormTrigger,
  FieldError as RHFFieldError,
} from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { addYears, format, parseISO, startOfToday } from "date-fns"
import { ar as arabicDateLocale, enUS } from "date-fns/locale"
import slugify from "slugify"
import {
  CalendarIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
  PackageIcon,
  LayersIcon,
  ImageIcon,
  SparklesIcon,
  GlobeIcon,
  TagIcon,
  Wand2Icon,
  PencilIcon,
  AlertCircleIcon,
  CornerDownRightIcon,
  ImageOffIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Server actions
import { createProduct } from "@/lib/actions/products/mutations/create"
import { updateProduct } from "@/lib/actions/products/mutations/update"

// Types & schemas
import type {
  CreateProductInput,
  ProductWithRelations,
} from "@/lib/actions/products/types"
import { createProductSchema } from "@/lib/actions/products/schemas"

import { Category } from "@/lib/actions/categories"
import type { BrandRecord } from "@/lib/actions/brands/types"

import { CategoryFormSheet } from "@/components/dashboard/categories/category-form-sheet"
import { DeleteCategoryDialog } from "@/components/dashboard/categories/delete-category-dialog"
import { BrandFormSheet } from "@/components/dashboard/brands/brand-form-sheet"
import { DeleteBrandDialog } from "@/components/dashboard/brands/delete-brand-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"

type FormValues = CreateProductInput

interface CategoryTreeRow {
  category: Category
  depth: number
}

function flattenCategoryTree(categories: Category[]): CategoryTreeRow[] {
  const categoryIds = new Set(categories.map((category) => category.id))
  const childrenByParent = new Map<string | null, Category[]>()

  for (const category of categories) {
    const parentId =
      category.parent_id &&
      category.parent_id !== category.id &&
      categoryIds.has(category.parent_id)
        ? category.parent_id
        : null
    const siblings = childrenByParent.get(parentId) ?? []
    siblings.push(category)
    childrenByParent.set(parentId, siblings)
  }

  const sortCategories = (items: Category[]) =>
    items.sort(
      (left, right) =>
        (left.sort_order ?? 0) - (right.sort_order ?? 0) ||
        left.name.localeCompare(right.name)
    )
  const rows: CategoryTreeRow[] = []
  const visited = new Set<string>()

  const addBranch = (category: Category, depth: number) => {
    if (visited.has(category.id)) return
    visited.add(category.id)
    rows.push({ category, depth })

    for (const child of sortCategories(
      childrenByParent.get(category.id) ?? []
    )) {
      addBranch(child, depth + 1)
    }
  }

  for (const root of sortCategories(childrenByParent.get(null) ?? [])) {
    addBranch(root, 0)
  }

  for (const category of sortCategories([...categories])) {
    addBranch(category, 0)
  }

  return rows
}

function ProductFieldError({ error }: { error?: RHFFieldError }) {
  const t = useTranslations("ProductForm")

  if (!error) return null

  const message = error.message ?? ""
  const translatedMessage =
    message && t.has(message as never) ? t(message as never) : message

  return <FieldError errors={[{ ...error, message: translatedMessage }]} />
}

const DEFAULT_VARIANT = {
  sku: "",
  name: "",
  attributes: {},
  price: 0,
  compare_at_price: null,
  stock_quantity: 0,
  track_inventory: true,
  low_stock_threshold: 5,
  expiration_date: "",
  is_active: true,
  sort_order: 1,
}

const DEFAULT_IMAGE = {
  url: "",
  alt_text: "",
  is_primary: true,
  variant_sku: "",
}

function normalizeGeneralImagePrimary<
  T extends { is_primary: boolean; variant_sku?: string | null },
>(images: T[]): T[] {
  const primaryGeneralIndex = images.findIndex(
    (image) => !image.variant_sku?.trim() && image.is_primary
  )
  const primaryIndex =
    primaryGeneralIndex >= 0
      ? primaryGeneralIndex
      : images.findIndex((image) => !image.variant_sku?.trim())

  return images.map((image, index) => ({
    ...image,
    is_primary: !image.variant_sku?.trim() && index === primaryIndex,
  }))
}

function setImageVariantSku(
  index: number,
  variantSku: string,
  getValues: UseFormGetValues<FormValues>,
  setValue: UseFormSetValue<FormValues>
) {
  const normalizedSku = variantSku.trim()
  const images = getValues("images") ?? []
  const updatedImages = images.map((image, imageIndex) =>
    imageIndex === index ? { ...image, variant_sku: normalizedSku } : image
  )

  const existingPrimaryGeneralIndex = updatedImages.findIndex(
    (image) => !image.variant_sku?.trim() && image.is_primary
  )
  const primaryIndex =
    existingPrimaryGeneralIndex >= 0
      ? existingPrimaryGeneralIndex
      : updatedImages.findIndex((image) => !image.variant_sku?.trim())

  updatedImages.forEach((image, imageIndex) => {
    setValue(
      `images.${imageIndex}.is_primary`,
      !image.variant_sku?.trim() && imageIndex === primaryIndex,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    )
  })

  setValue(`images.${index}.variant_sku`, normalizedSku, {
    shouldDirty: true,
    shouldValidate: true,
  })
}

const PRESET_ATTRIBUTE_KEYS = ["color", "weight", "size", "flavor", "material"]

type NumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type"
> & {
  value: number | null | undefined
  emptyValue: number | null
  onValueChange: (value: number | null) => void
}

// Preserves draft text while typing so the user can clear the field or enter decimals without snapping to 0
function NumberInput({
  value,
  emptyValue,
  onValueChange,
  onBlur,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = React.useState<string | null>(null)

  return (
    <Input
      {...props}
      type="number"
      value={draft ?? value ?? ""}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        onValueChange(raw === "" ? emptyValue : Number(raw))
      }}
      onFocus={(e) => e.target.select()}
      onBlur={(e) => {
        setDraft(null)
        onBlur?.(e)
      }}
      // Prevents accidental value changes when scrolling with the mouse wheel
      onWheel={(e) => e.currentTarget.blur()}
    />
  )
}

function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    replacement: "-",
    trim: true,
  })
}

function generateRandomSku(productName?: string, variantName?: string): string {
  const cleanWord = (text?: string) =>
    (text || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase()

  const pPart = cleanWord(productName) || "PRD"
  const vPart = cleanWord(variantName)
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()

  return vPart ? `${pPart}-${vPart}-${rand}` : `${pPart}-${rand}`
}

interface ProductFormProps {
  product?: ProductWithRelations | null
  categories: Category[] | null
  brands: BrandRecord[] | null
}

export default function ProductForm({
  product,
  categories: initialCategories,
  brands: initialBrands,
}: ProductFormProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("ProductForm")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = React.useState(false)
  const [pendingHref, setPendingHref] = React.useState<string | null>(null)
  const formRef = React.useRef<HTMLFormElement>(null)

  const isEditing = Boolean(product)

  const categoriesList = React.useMemo(
    () => initialCategories ?? [],
    [initialCategories]
  )
  const categoryTree = React.useMemo(
    () => flattenCategoryTree(categoriesList),
    [categoriesList]
  )
  const brandsList = React.useMemo(() => initialBrands ?? [], [initialBrands])

  const [brandModal, setBrandModal] = React.useState<{
    type: "create" | "update" | "delete" | null
    data: BrandRecord | null
  }>({ type: null, data: null })

  const [categoryModal, setCategoryModal] = React.useState<{
    type: "create" | "update" | "delete" | null
    data: Category | null
  }>({ type: null, data: null })

  const initialImages = React.useMemo(() => {
    if (!product?.product_images || product.product_images.length === 0) {
      return [DEFAULT_IMAGE]
    }
    const variantSkuById = new Map(
      (product.product_variants ?? []).map((variant) => [
        variant.id,
        variant.sku.toUpperCase(),
      ])
    )

    return normalizeGeneralImagePrimary(
      product.product_images.map((img) => {
        return {
          url: img.url,
          alt_text: img.alt_text || "",
          is_primary: img.is_primary,
          variant_sku: img.variant_id
            ? (variantSkuById.get(img.variant_id) ?? "")
            : "",
        }
      })
    )
  }, [product])

  const initialVariants = React.useMemo(() => {
    if (!product?.product_variants || product.product_variants.length === 0) {
      return [DEFAULT_VARIANT]
    }
    // Order matters: sort_order is recalculated from item index on save
    const sortedVariants = [...product.product_variants].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )
    return sortedVariants.map((v, idx) => ({
      sku: v.sku.toUpperCase(),
      name: v.name || "",
      attributes: v.attributes,
      price: Number(v.price) / 100,
      compare_at_price:
        v.compare_at_price != null ? Number(v.compare_at_price) / 100 : null,
      stock_quantity: v.stock_quantity,
      track_inventory: v.track_inventory,
      low_stock_threshold: v.low_stock_threshold,
      expiration_date: v.expiration_date ?? "",
      is_active: v.is_active,
      sort_order: v.sort_order || idx + 1,
    }))
  }, [product])

  const form = useForm<FormValues>({
    resolver: zodResolver(createProductSchema),
    mode: "onChange",
    shouldFocusError: false,
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      category_id: product?.category_id || "",
      brand_id: product?.brand_id || "",
      description: product?.description || null,
      meta_title: product?.meta_title || null,
      meta_description: product?.meta_description || null,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      variants: initialVariants,
      images: initialImages,
    },
  })

  const {
    formState: { isSubmitting, isDirty, dirtyFields },
    control,
    setValue,
    setFocus,
    getValues,
    trigger,
  } = form

  const isBusy = isSubmitting || isRedirecting
  // Keep slug locked in edit mode to avoid breaking published URLs
  const isSlugLockedRef = React.useRef(isEditing)

  // Warn before closing or refreshing the browser tab when there are unsaved changes
  React.useEffect(() => {
    if (!isDirty || isRedirecting) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isDirty, isRedirecting])

  React.useEffect(() => {
    if (!isDirty || isRedirecting) return

    const interceptInternalLinks = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest<HTMLAnchorElement>("a[href]")
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target.toLowerCase() !== "_self")
      ) {
        return
      }

      const href = anchor.getAttribute("href")?.trim()
      if (!href || href.startsWith("#")) return

      const destination = new URL(anchor.href, window.location.href)
      if (
        destination.origin !== window.location.origin ||
        (destination.protocol !== "http:" && destination.protocol !== "https:")
      ) {
        return
      }

      const current = new URL(window.location.href)
      if (
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.hash
      ) {
        return
      }

      event.preventDefault()
      setPendingHref(
        `${destination.pathname}${destination.search}${destination.hash}`
      )
      setIsDiscardDialogOpen(true)
    }

    document.addEventListener("click", interceptInternalLinks, true)
    return () =>
      document.removeEventListener("click", interceptInternalLinks, true)
  }, [isDirty, isRedirecting])

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    insert: insertVariant,
  } = useFieldArray({
    control,
    name: "variants",
  })

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    insert: insertImage,
  } = useFieldArray({
    control,
    name: "images",
  })

  const descriptionValue = useWatch({ control, name: "description" }) || ""
  const currentProductName = useWatch({ control, name: "name" }) || ""
  const selectedBrandId = useWatch({ control, name: "brand_id" })
  const selectedCategoryId = useWatch({ control, name: "category_id" })

  const selectedCategoryObject = React.useMemo(() => {
    return categoriesList.find((cat) => cat.id === selectedCategoryId) || null
  }, [categoriesList, selectedCategoryId])

  const selectedBrandObject = React.useMemo(() => {
    return brandsList.find((b) => b.id === selectedBrandId) || null
  }, [brandsList, selectedBrandId])

  const handleGenerateAllSeo = () => {
    if (!currentProductName.trim()) {
      toast.error(t("ENTER_NAME_FOR_SEO_ERROR"))
      setFocus("name")
      return
    }

    setErrorMessage(null)

    const brandSuffix = selectedBrandObject
      ? ` | ${locale === "ar" && selectedBrandObject.name_ar ? selectedBrandObject.name_ar : selectedBrandObject.name}`
      : ""
    const generatedTitle = `${currentProductName.trim()}${brandSuffix}`.slice(
      0,
      70
    )

    let generatedDescription = ""
    if (descriptionValue.trim()) {
      const cleanDesc = descriptionValue.replace(/\s+/g, " ").trim()
      generatedDescription =
        cleanDesc.length > 157 ? `${cleanDesc.slice(0, 157)}...` : cleanDesc
    } else {
      const categoryName = selectedCategoryObject
        ? locale === "ar" && selectedCategoryObject.name_ar
          ? selectedCategoryObject.name_ar
          : selectedCategoryObject.name
        : ""
      const brandName = selectedBrandObject
        ? locale === "ar" && selectedBrandObject.name_ar
          ? selectedBrandObject.name_ar
          : selectedBrandObject.name
        : ""

      const categoryPart = categoryName ? ` in ${categoryName}` : ""
      const brandPart = brandName ? ` by ${brandName}` : ""

      generatedDescription = (
        locale === "ar"
          ? `تسوق ${currentProductName.trim()}${brandName ? ` من ${brandName}` : ""}${categoryName ? ` ضمن ${categoryName}` : ""}. جودة عالية وأسعار مناسبة مع توصيل سريع وموثوق.`
          : `Shop ${currentProductName.trim()}${brandPart}${categoryPart}. High quality at the best prices with fast and reliable delivery.`
      ).slice(0, 160)
    }

    const previousTitle = getValues("meta_title")
    const previousDescription = getValues("meta_description")

    setValue("meta_title", generatedTitle, {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue("meta_description", generatedDescription, {
      shouldValidate: true,
      shouldDirty: true,
    })
    toast.success(t("SEO_GENERATED_SUCCESS"), {
      // Show Undo only if existing text was replaced
      action:
        previousTitle || previousDescription
          ? {
              label: t("UNDO"),
              onClick: () => {
                setValue("meta_title", previousTitle, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
                setValue("meta_description", previousDescription, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              },
            }
          : undefined,
    })
  }

  async function onSubmit(data: FormValues) {
    setErrorMessage(null)

    const payload: CreateProductInput = {
      ...data,
      description: data.description || null,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      variants: data.variants.map((v, idx) => ({
        ...v,
        name: v.name || "",
        attributes: v.attributes || {},
        sort_order: idx + 1,
        price: Math.round(Number(v.price) * 100),
        compare_at_price:
          v.compare_at_price !== null && v.compare_at_price !== undefined
            ? Math.round(Number(v.compare_at_price) * 100)
            : null,
        expiration_date: v.expiration_date || null,
      })),
      images: data.images.map((img) => ({
        ...img,
        alt_text: img.alt_text || "",
        variant_sku: img.variant_sku || "",
      })),
    }

    const showError = (message: string) => {
      setErrorMessage(message)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    const fallbackError = t(isEditing ? "UPDATE_ERROR" : "CREATE_ERROR")

    try {
      const result =
        isEditing && product
          ? await updateProduct({ ...payload, id: product.id })
          : await createProduct(payload)

      if (result.success) {
        setIsRedirecting(true)
        toast.success(t(isEditing ? "UPDATE_SUCCESS" : "CREATE_SUCCESS"))
        router.push("/dashboard/products")
        router.refresh()
        return
      }

      console.error("Submission Error:", result)
      showError(
        result.error && t.has(result.error as never)
          ? t(result.error as never)
          : fallbackError
      )
    } catch (error) {
      console.error("Submission Error:", error)
      showError(fallbackError)
    }
  }

  const onInvalid = () => {
    setErrorMessage(t("FORM_VALIDATION_ERROR"))

    // Scroll to the first invalid field instead of jumping to the top of the page
    window.setTimeout(() => {
      const invalidField = Array.from(
        formRef.current?.querySelectorAll<HTMLElement>(
          '[data-invalid="true"]'
        ) ?? []
      ).sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
      )[0]

      if (!invalidField) {
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      invalidField.scrollIntoView({ behavior: "smooth", block: "center" })
      invalidField
        .querySelector<HTMLElement>("input, textarea, button")
        ?.focus({ preventScroll: true })
    }, 50)
  }

  const handleDiscard = () => {
    if (isDirty) {
      setPendingHref(null)
      setIsDiscardDialogOpen(true)
      return
    }

    setIsRedirecting(true)
    router.back()
  }

  const handleConfirmDiscard = () => {
    setIsDiscardDialogOpen(false)
    setIsRedirecting(true)

    if (pendingHref) {
      router.push(pendingHref)
    } else {
      router.back()
    }
  }

  // Remove variant: unlink its images and provide an Undo action
  const handleRemoveVariant = (index: number) => {
    const removed = getValues(`variants.${index}`)
    const otherSkus = getValues("variants")
      .filter((_, i) => i !== index)
      .map((v) => v.sku)
    const linkedImages: number[] = []

    if (removed.sku && !otherSkus.includes(removed.sku)) {
      getValues("images").forEach((image, i) => {
        if (image.variant_sku !== removed.sku) return
        linkedImages.push(i)
        setImageVariantSku(i, "", getValues, setValue)
      })
    }
    removeVariant(index)

    toast(t("VARIANT_REMOVED"), {
      action: {
        label: t("UNDO"),
        onClick: () => {
          insertVariant(index, removed)
          linkedImages.forEach((i) => {
            const image = getValues("images")[i]
            if (image && !image.variant_sku) {
              setImageVariantSku(i, removed.sku, getValues, setValue)
            }
          })
        },
      },
    })
  }

  // Remove image: ensure a primary general image remains and provide an Undo action
  const handleRemoveImage = (index: number) => {
    const removed = getValues(`images.${index}`)
    removeImage(index)
    if (removed.is_primary && !removed.variant_sku?.trim()) {
      const remainingImages = getValues("images")
      const hasPrimaryGeneralImage = remainingImages.some(
        (image) => !image.variant_sku?.trim() && image.is_primary
      )
      const fallbackIndex = remainingImages.findIndex(
        (image) => !image.variant_sku?.trim()
      )
      if (!hasPrimaryGeneralImage && fallbackIndex >= 0) {
        setValue(`images.${fallbackIndex}.is_primary`, true, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    }

    toast(t("IMAGE_REMOVED"), {
      action: {
        label: t("UNDO"),
        onClick: () => {
          insertImage(index, removed)
          if (removed.is_primary && !removed.variant_sku?.trim()) {
            getValues("images").forEach((image, i) => {
              setValue(`images.${i}.is_primary`, i === index, {
                shouldDirty: true,
                shouldValidate: true,
              })
            })
          }
        },
      },
    })
  }

  // Render organization fields with Arabic name support (name_ar)
  const renderOrganizationFields = () => (
    <FieldGroup className="space-y-3.5">
      {/* Category */}
      <Controller
        name="category_id"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-xs">
              {t("CATEGORY")} <span className="text-destructive">*</span>
            </FieldLabel>

            <div className="flex items-center gap-1.5">
              <Select
                onValueChange={(val) =>
                  field.onChange(val === "none" ? "" : val)
                }
                value={field.value || "none"}
              >
                <SelectTrigger
                  aria-invalid={fieldState.invalid}
                  className="min-w-0 flex-1 text-xs"
                >
                  <SelectValue placeholder={t("SELECT_CATEGORY")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("SELECT_CATEGORY")}</SelectItem>
                  {categoryTree.map(({ category, depth }) => {
                    const displayName =
                      locale === "ar" && category.name_ar
                        ? category.name_ar
                        : category.name
                    return (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        disabled={category.is_active !== true}
                        style={{ paddingInlineStart: `${8 + depth * 16}px` }}
                      >
                        {depth > 0 && (
                          <CornerDownRightIcon
                            className="size-3 text-muted-foreground rtl:-scale-x-100"
                            aria-hidden="true"
                          />
                        )}
                        <span>{displayName}</span>
                        {category.is_active !== true && (
                          <span className="text-muted-foreground">
                            ({t("INACTIVE_CATEGORY")})
                          </span>
                        )}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              <CategoryFormSheet
                open={categoryModal.type === "create"}
                category={null}
                categories={categoriesList}
                categoryImages={[]}
                onOpenChange={(open) =>
                  setCategoryModal(
                    open
                      ? { type: "create", data: null }
                      : { type: null, data: null }
                  )
                }
                onSaved={() => {
                  setCategoryModal({ type: null, data: null })
                  router.refresh()
                }}
                trigger={
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    title={t("CREATE_CATEGORY")}
                    aria-label={t("CREATE_CATEGORY")}
                    className="size- shrink-0 cursor-pointer"
                  >
                    <PlusIcon className="size-3.5" />
                  </Button>
                }
              />

              {selectedCategoryObject && (
                <>
                  <CategoryFormSheet
                    open={
                      categoryModal.type === "update" &&
                      categoryModal.data?.id === selectedCategoryObject.id
                    }
                    category={selectedCategoryObject}
                    categories={categoriesList}
                    categoryImages={[]}
                    onOpenChange={(open) =>
                      setCategoryModal(
                        open
                          ? { type: "update", data: selectedCategoryObject }
                          : { type: null, data: null }
                      )
                    }
                    onSaved={() => {
                      setCategoryModal({ type: null, data: null })
                      router.refresh()
                    }}
                    trigger={
                      <Button
                        type="button"                    size="icon"

                        variant="outline"
                        title={t("EDIT_CATEGORY")}
                        aria-label={t("EDIT_CATEGORY")}
                        className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                    }
                  />

                  <DeleteCategoryDialog
                    category={selectedCategoryObject}
                    open={
                      categoryModal.type === "delete" &&
                      categoryModal.data?.id === selectedCategoryObject.id
                    }
                    onOpenChange={(open) =>
                      setCategoryModal(
                        open
                          ? { type: "delete", data: selectedCategoryObject }
                          : { type: null, data: null }
                      )
                    }
                    onDeleted={(deletedCategory) => {
                      if (
                        form.getValues("category_id") === deletedCategory.id
                      ) {
                        setValue("category_id", "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      setCategoryModal({ type: null, data: null })
                      router.refresh()
                    }}
                  >
                    <Button
                      type="button"                    size="icon"

                      variant="outline"
                      title={t("DELETE_CATEGORY")}
                      aria-label={t("DELETE_CATEGORY")}
                      className="shrink-0 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </DeleteCategoryDialog>
                </>
              )}
            </div>

            {fieldState.invalid && (
              <ProductFieldError error={fieldState.error} />
            )}
          </Field>
        )}
      />

      {/* Brand */}
      <Controller
        name="brand_id"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="text-xs">
              {t("BRAND")} <span className="text-destructive">*</span>
            </FieldLabel>

            <div className="flex items-center gap-1.5">
              <Select
                // Radix may emit an empty value before a newly created brand reaches the list
                onValueChange={(val) => val && field.onChange(val)}
                value={field.value || ""}
              >
                <SelectTrigger
                  aria-invalid={fieldState.invalid}
                  className="min-w-0 flex-1 text-xs"
                >
                  <SelectValue placeholder={t("SELECT_BRAND")} />
                </SelectTrigger>
                <SelectContent>
                  {brandsList.map((brand) => {
                    const displayBrandName =
                      locale === "ar" && brand.name_ar
                        ? brand.name_ar
                        : brand.name
                    return (
                      <SelectItem key={brand.id} value={brand.id}>
                        {displayBrandName}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              <BrandFormSheet
                open={brandModal.type === "create"}
                brand={null}
                brandImages={[]}
                onOpenChange={(open) =>
                  setBrandModal(
                    open
                      ? { type: "create", data: null }
                      : { type: null, data: null }
                  )
                }
                onSaved={(savedBrand) => {
                  setValue("brand_id", savedBrand.id, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                  setBrandModal({ type: null, data: null })
                  router.refresh()
                }}
                trigger={
                  <Button
                    type="button"                    size="icon"

                    variant="outline"
                    title={t("CREATE_BRAND")}
                    aria-label={t("CREATE_BRAND")}
                    className="shrink-0 cursor-pointer"
                  >
                    <PlusIcon className="size-3.5" />
                  </Button>
                }
              />

              {selectedBrandObject && (
                <>
                  <BrandFormSheet
                    open={
                      brandModal.type === "update" &&
                      brandModal.data?.id === selectedBrandObject.id
                    }
                    brand={selectedBrandObject}
                    brandImages={[]}
                    onOpenChange={(open) =>
                      setBrandModal(
                        open
                          ? { type: "update", data: selectedBrandObject }
                          : { type: null, data: null }
                      )
                    }
                    onSaved={() => {
                      setBrandModal({ type: null, data: null })
                      router.refresh()
                    }}
                    trigger={
                      <Button
                        type="button"                    size="icon"

                        variant="outline"
                        title={t("EDIT_BRAND")}
                        aria-label={t("EDIT_BRAND")}
                        className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                    }
                  />

                  <DeleteBrandDialog
                    brand={selectedBrandObject}
                    open={
                      brandModal.type === "delete" &&
                      brandModal.data?.id === selectedBrandObject.id
                    }
                    onOpenChange={(open) =>
                      setBrandModal(
                        open
                          ? { type: "delete", data: selectedBrandObject }
                          : { type: null, data: null }
                      )
                    }
                    onDeleted={(deletedBrand) => {
                      if (form.getValues("brand_id") === deletedBrand.id) {
                        setValue("brand_id", "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      setBrandModal({ type: null, data: null })
                      router.refresh()
                    }}
                  >
                    <Button
                      type="button"                    size="icon"

                      variant="outline"
                      title={t("DELETE_BRAND")}
                      aria-label={t("DELETE_BRAND")}
                      className="shrink-0 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </DeleteBrandDialog>
                </>
              )}
            </div>
            {fieldState.invalid && (
              <ProductFieldError error={fieldState.error} />
            )}
          </Field>
        )}
      />
    </FieldGroup>
  )

  return (
    <>
      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          // React events bubble through Portals: ignore submissions from nested modal forms
          if (event.target !== event.currentTarget) return
          event.preventDefault()
          if (isBusy) return
          void form.handleSubmit(onSubmit, onInvalid)(event)
        }}
        className="space-y-6"
      >
        {errorMessage && (
          <Alert variant="destructive" className="relative pe-9">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>{t("ALERT_TITLE")}</AlertTitle>
            <AlertDescription className="text-xs">
              {errorMessage}
            </AlertDescription>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="absolute end-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground"
              aria-label={t("CLOSE_ERROR_ALERT")}
            >
              <XIcon className="size-4" />
            </button>
          </Alert>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Mobile: contents + order for card ordering; Desktop: 2-column layout */}
          <div className="contents lg:col-span-2 lg:flex lg:min-w-0 lg:flex-col lg:gap-6">
            {/* Basic Information */}
            <div className="order-1 min-w-0 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-none">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <PackageIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("BASIC_INFORMATION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("BASIC_INFORMATION_DESCRIPTION")}
                  </p>
                </div>
              </div>

              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Product Name */}
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="product-name" className="text-xs">
                          {t("PRODUCT_NAME")}{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="product-name"
                          placeholder={t("PRODUCT_NAME_PLACEHOLDER")}
                          className="text-xs"
                          onChange={(e) => {
                            field.onChange(e)
                            if (
                              !isEditing &&
                              (!dirtyFields.slug || !isSlugLockedRef.current)
                            ) {
                              setValue("slug", generateSlug(e.target.value), {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            }
                          }}
                        />
                        {fieldState.invalid && (
                          <ProductFieldError error={fieldState.error} />
                        )}
                      </Field>
                    )}
                  />

                  {/* URL Slug */}
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="product-slug" className="text-xs">
                          {t("URL_SLUG")}{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="product-slug"
                          placeholder={t("URL_SLUG_PLACEHOLDER")}
                          className="font-mono text-xs"
                          dir="ltr"
                          onChange={(e) => {
                            // Clearing the field re-enables auto-generation for new products
                            isSlugLockedRef.current =
                              isEditing || e.target.value !== ""
                            field.onChange(e)
                          }}
                          onBlur={() => {
                            const cleanSlug = generateSlug(field.value ?? "")
                            if (cleanSlug && cleanSlug !== field.value) {
                              field.onChange(cleanSlug)
                            }
                            field.onBlur()
                          }}
                        />
                        {fieldState.invalid && (
                          <ProductFieldError error={fieldState.error} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Description */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel
                          htmlFor="product-description"
                          className="text-xs"
                        >
                          {t("DESCRIPTION")}
                        </FieldLabel>
                        <span
                          className={`text-[10px] tabular-nums ${descriptionValue.length > 500 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {descriptionValue.length}/500
                        </span>
                      </div>
                      <InputGroup className="bg-background">
                        <InputGroupTextarea
                          {...field}
                          id="product-description"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                          placeholder={t("DESCRIPTION_PLACEHOLDER")}
                          rows={4}
                          maxLength={500}
                          className="resize-y text-xs"
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <ProductFieldError error={fieldState.error} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {/* Variants & Pricing */}
            <div className="order-3 min-w-0 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-none">
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <LayersIcon className="size-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-card-foreground">
                      {t("VARIANTS_PRICING")}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {t("VARIANTS_DESCRIPTION")}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendVariant({
                      ...DEFAULT_VARIANT,
                      sort_order: variantFields.length + 1,
                    })
                  }
                  className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
                >
                  <PlusIcon className="size-3.5" />
                  {t("ADD_VARIANT")}
                </Button>
              </div>

              <div className="space-y-4">
                {variantFields.map((field, index) => (
                  <VariantCard
                    key={field.id}
                    index={index}
                    control={control}
                    setValue={setValue}
                    getValues={getValues}
                    trigger={trigger}
                    totalVariants={variantFields.length}
                    onRemove={() => handleRemoveVariant(index)}
                  />
                ))}
              </div>
            </div>

            {/* Media Gallery */}
            <div className="order-4 min-w-0 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-none">
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-card-foreground">
                      {t("MEDIA_GALLERY")}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {t("MEDIA_DESCRIPTION")}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendImage({ ...DEFAULT_IMAGE, is_primary: false })
                  }
                  className="h-8 cursor-pointer gap-1.5 text-xs font-medium"
                >
                  <PlusIcon className="size-3.5" />
                  {t("ADD_IMAGE")}
                </Button>
              </div>

              <div className="space-y-4">
                {imageFields.map((field, index) => (
                  <ImageCard
                    key={field.id}
                    index={index}
                    control={control}
                    setValue={setValue}
                    getValues={getValues}
                    totalImages={imageFields.length}
                    onRemove={() => handleRemoveImage(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="contents lg:col-span-1 lg:flex lg:min-w-0 lg:flex-col lg:gap-6">
            {/* Product Status */}
            <div className="order-5 min-w-0 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-none">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <SparklesIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("PRODUCT_STATUS")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("PRODUCT_STATUS_DESCRIPTION")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Active */}
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/15 p-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold">
                          {t("ACTIVE")}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          {t("VISIBLE_FOR_PURCHASE")}
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />

                {/* Featured */}
                <Controller
                  name="is_featured"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/15 p-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold">
                          {t("FEATURED")}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          {t("FEATURED_DESCRIPTION")}
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Organization */}
            <div className="order-2 min-w-0 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-none">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <TagIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    {t("ORGANIZATION")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("ORGANIZATION_DESCRIPTION")}
                  </p>
                </div>
              </div>
              {renderOrganizationFields()}
            </div>

            {/* SEO Details */}
            <div className="order-6 min-w-0 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-none">
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <GlobeIcon className="size-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-card-foreground">
                      {t("SEO_DETAILS")}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {t("SEO_DESCRIPTION")}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAllSeo}
                  className="h-8 cursor-pointer gap-1.5 px-2.5 text-[11px] font-medium text-primary hover:text-primary"
                >
                  <Wand2Icon className="size-3" />
                  {t("GENERATE_SEO")}
                </Button>
              </div>

              <FieldGroup className="space-y-3.5">
                {/* Meta Title */}
                <Controller
                  name="meta_title"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="meta-title" className="text-xs">
                          {t("META_TITLE")}
                        </FieldLabel>
                        <span
                          className={`text-[10px] tabular-nums ${(field.value ?? "").length > 70 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {(field.value ?? "").length}/70
                        </span>
                      </div>
                      <Input
                        {...field}
                        id="meta-title"
                        value={field.value ?? ""}
                        placeholder={t("META_TITLE_PLACEHOLDER")}
                        maxLength={70}
                        className="text-xs"
                      />
                      {fieldState.invalid && (
                        <ProductFieldError error={fieldState.error} />
                      )}
                    </Field>
                  )}
                />

                {/* Meta Description */}
                <Controller
                  name="meta_description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel
                          htmlFor="meta-description"
                          className="text-xs"
                        >
                          {t("META_DESCRIPTION")}
                        </FieldLabel>
                        <span
                          className={`text-[10px] tabular-nums ${(field.value ?? "").length > 160 ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {(field.value ?? "").length}/160
                        </span>
                      </div>
                      <InputGroup className="bg-background">
                        <InputGroupTextarea
                          {...field}
                          id="meta-description"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                          placeholder={t("META_DESCRIPTION_PLACEHOLDER")}
                          rows={3}
                          maxLength={160}
                          className="resize-y text-xs"
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <ProductFieldError error={fieldState.error} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {/* Actions */}
            <div className="order-7 min-w-0 rounded-xl border border-border bg-card p-5 shadow-xs lg:order-none">
              <div className="mb-4 border-b border-border/60 pb-3">
                <h2 className="text-sm font-semibold text-card-foreground">
                  {t("ACTIONS")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("ACTIONS_DESCRIPTION")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isBusy}
                  className="w-full cursor-pointer text-xs shadow-xs"
                >
                  {isBusy ? (
                    <>
                      <Spinner className="me-2 size-4" />
                      {t("SAVING")}
                    </>
                  ) : (
                    <>{isEditing ? t("UPDATE_PRODUCT") : t("SAVE_PRODUCT")}</>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={handleDiscard}
                  className="w-full text-xs"
                >
                  {t("DISCARD_CHANGES")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <AlertDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
      >
        <AlertDialogContent
          dir={locale === "ar" ? "rtl" : "ltr"}
          className="text-start"
        >
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>{t("UNSAVED_CHANGES_TITLE")}</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              {t("UNSAVED_CHANGES_DESCRIPTION")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-xs"
              onClick={() => setPendingHref(null)}
            >
              {t("KEEP_EDITING")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="text-xs"
              onClick={handleConfirmDiscard}
            >
              {t("DISCARD_CHANGES")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface VariantCardProps {
  index: number
  control: Control<FormValues>
  setValue: UseFormSetValue<FormValues>
  getValues: UseFormGetValues<FormValues>
  trigger: UseFormTrigger<FormValues>
  totalVariants: number
  onRemove: () => void
}

function VariantCard({
  index,
  control,
  setValue,
  getValues,
  trigger,
  totalVariants,
  onRemove,
}: VariantCardProps) {
  const t = useTranslations("ProductForm")
  const locale = useLocale()
  const [isExpirationPickerOpen, setIsExpirationPickerOpen] =
    React.useState(false)
  const expirationMinDate = React.useMemo(() => startOfToday(), [])
  const expirationMaxDate = React.useMemo(
    () => addYears(expirationMinDate, 10),
    [expirationMinDate]
  )
  const variantName = useWatch({ control, name: `variants.${index}.name` })
  const productName = useWatch({ control, name: "name" })
  const tracksInventory = useWatch({
    control,
    name: `variants.${index}.track_inventory`,
  })
  // Linked images for this variant, captured before SKU edits
  const linkedImagesRef = React.useRef<number[]>([])

  const captureLinkedImages = () => {
    const sku = getValues(`variants.${index}.sku`)
    const isShared = getValues("variants").some(
      (v, i) => i !== index && v.sku === sku
    )
    linkedImagesRef.current =
      sku && !isShared
        ? getValues("images").flatMap((image, i) =>
            image.variant_sku === sku ? [i] : []
          )
        : []
  }

  const syncLinkedImages = (sku: string) => {
    linkedImagesRef.current.forEach((i) => {
      setImageVariantSku(i, sku, getValues, setValue)
    })
  }

  const handleGenerateSku = () => {
    const newSku = generateRandomSku(productName, variantName)
    captureLinkedImages()
    syncLinkedImages(newSku)
    setValue(`variants.${index}.sku`, newSku, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  return (
    <div className="relative rounded-lg border border-border bg-muted/10 p-4 transition-all hover:border-muted-foreground/30">
      <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
            {index + 1}
          </span>
          <span className="text-xs font-semibold">
            {variantName || t("VARIANT_NUMBER", { number: index + 1 })}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
          disabled={totalVariants === 1}
          aria-label={t("REMOVE_VARIANT")}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* SKU Code */}
        <Controller
          name={`variants.${index}.sku`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                {t("SKU_CODE")} <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  placeholder={t("SKU_PLACEHOLDER")}
                  className="h-8 pr-8 text-xs"
                  dir="ltr"
                  onFocus={captureLinkedImages}
                  onChange={(e) => {
                    const input = e.target
                    const caret = input.selectionStart
                    // Stored value matches displayed format (uppercase without spaces)
                    const sku = input.value.replace(/\s/g, "-").toUpperCase()
                    field.onChange(sku)
                    syncLinkedImages(sku)
                    window.requestAnimationFrame(() =>
                      input.setSelectionRange(caret, caret)
                    )
                  }}
                />
                <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleGenerateSku}
                    title={t("GENERATE_SKU")}
                    aria-label={t("GENERATE_SKU")}
                    className="pointer-events-auto size-6 cursor-pointer text-muted-foreground transition-none hover:text-primary"
                  >
                    <Wand2Icon className="size-3.5" />
                  </Button>
                </div>
              </div>
              {fieldState.invalid && (
                <ProductFieldError error={fieldState.error} />
              )}
            </Field>
          )}
        />

        {/* Variant Name (Optional) */}
        <Controller
          name={`variants.${index}.name`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                {t("VARIANT_NAME_OPTIONAL")}
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder={t("VARIANT_NAME_PLACEHOLDER")}
                className="h-8 text-xs"
              />
              {fieldState.invalid && (
                <ProductFieldError error={fieldState.error} />
              )}
            </Field>
          )}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Price */}
        <Controller
          name={`variants.${index}.price`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                {t("PRICE")} <span className="text-destructive">*</span>
              </FieldLabel>
              <NumberInput
                {...field}
                emptyValue={0}
                onValueChange={(val) => {
                  field.onChange(val)
                  void trigger(`variants.${index}.compare_at_price`)
                }}
                step="0.01"
                min="0"
                inputMode="decimal"
                className="h-8 text-xs"
              />
              {fieldState.invalid && (
                <ProductFieldError error={fieldState.error} />
              )}
            </Field>
          )}
        />

        {/* Compare-at Price */}
        <Controller
          name={`variants.${index}.compare_at_price`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                {t("COMPARE_AT_PRICE")}
              </FieldLabel>
              <NumberInput
                {...field}
                emptyValue={null}
                onValueChange={field.onChange}
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder={t("OPTIONAL")}
                className="h-8 text-xs"
              />
              {fieldState.invalid && (
                <ProductFieldError error={fieldState.error} />
              )}
            </Field>
          )}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Stock Quantity */}
        <Controller
          name={`variants.${index}.stock_quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                {t("STOCK_QUANTITY")}{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <NumberInput
                {...field}
                emptyValue={0}
                onValueChange={field.onChange}
                step="1"
                min="0"
                inputMode="numeric"
                disabled={!tracksInventory}
                className="h-8 text-xs"
              />
              {fieldState.invalid && (
                <ProductFieldError error={fieldState.error} />
              )}
            </Field>
          )}
        />

        {/* Expiration date (optional) */}
        <Controller
          name={`variants.${index}.expiration_date`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                {t("EXPIRATION_DATE")}
              </FieldLabel>
              <Popover
                open={isExpirationPickerOpen}
                onOpenChange={setIsExpirationPickerOpen}
              >
                <div className="relative">
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      aria-invalid={fieldState.invalid}
                      className={`h-8 w-full justify-start gap-2 px-2 text-xs font-normal ${
                        field.value ? "pe-8" : "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="size-3.5 shrink-0" />
                      {field.value
                        ? format(parseISO(field.value), "d/M/yyyy")
                        : t("OPTIONAL")}
                    </Button>
                  </PopoverTrigger>
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("CLEAR_DATE")}
                      className="absolute inset-e-1 top-1/2 z-10 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={(event) => {
                        event.stopPropagation()
                        field.onChange("")
                        setIsExpirationPickerOpen(false)
                      }}
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    defaultMonth={
                      field.value ? parseISO(field.value) : undefined
                    }
                    captionLayout="dropdown"
                    startMonth={expirationMinDate}
                    endMonth={expirationMaxDate}
                    disabled={[
                      { before: expirationMinDate },
                      { after: expirationMaxDate },
                    ]}
                    selected={field.value ? parseISO(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      setIsExpirationPickerOpen(false)
                    }}
                    locale={locale === "ar" ? arabicDateLocale : enUS}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && (
                <ProductFieldError error={fieldState.error} />
              )}
            </Field>
          )}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Track inventory & Active variant */}
        {(
          [
            ["track_inventory", "TRACK_INVENTORY"],
            ["is_active", "VARIANT_ACTIVE"],
          ] as const
        ).map(([key, labelKey]) => (
          <Controller
            key={key}
            name={`variants.${index}.${key}`}
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-muted/15 px-3 py-2 text-xs font-medium">
                {t(labelKey)}
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              </label>
            )}
          />
        ))}

        {/* Low stock threshold */}
        {tracksInventory && (
          <Controller
            name={`variants.${index}.low_stock_threshold`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs">
                  {t("LOW_STOCK_THRESHOLD")}
                </FieldLabel>
                <NumberInput
                  {...field}
                  emptyValue={0}
                  onValueChange={field.onChange}
                  step="1"
                  min="0"
                  inputMode="numeric"
                  className="h-8 text-xs"
                />
                {fieldState.invalid && (
                  <ProductFieldError error={fieldState.error} />
                )}
              </Field>
            )}
          />
        )}
      </div>

      {/* Variant Attributes (e.g., Color, Size, Weight) */}
      <div className="mt-3 pt-1">
        <Controller
          name={`variants.${index}.attributes`}
          control={control}
          render={({ field }) => (
            <VariantAttributesManager
              attributes={field.value ?? {}}
              onChange={field.onChange}
            />
          )}
        />
      </div>
    </div>
  )
}

interface ImageCardProps {
  index: number
  control: Control<FormValues>
  setValue: UseFormSetValue<FormValues>
  getValues: UseFormGetValues<FormValues>
  totalImages: number
  onRemove: () => void
}

function ImageCard({
  index,
  control,
  setValue,
  getValues,
  totalImages,
  onRemove,
}: ImageCardProps) {
  const locale = useLocale()
  const t = useTranslations("ProductForm")
  const currentUrl = useWatch({ control, name: `images.${index}.url` })
  const variants = useWatch({ control, name: "variants" }) || []
  const productName = useWatch({ control, name: "name" }) || ""
  const selectedVariantSku = useWatch({
    control,
    name: `images.${index}.variant_sku`,
  })

  const watchedImages = useWatch({ control, name: "images" }) || []
  const usedVariantSkus = watchedImages
    .map((img, i) => (i !== index ? img?.variant_sku : null))
    .filter((sku): sku is string => Boolean(sku))
  const isPrimary = watchedImages[index]?.is_primary ?? false
  const isGeneralImage = !selectedVariantSku?.trim()
  // Store failed URL so preview automatically recovers when changed
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null)
  const hasImageError = Boolean(currentUrl) && failedUrl === currentUrl

  const handleGenerateImageAlt = () => {
    if (!productName.trim()) {
      toast.error(t("SKU_NAME_REQUIRED"))
      return
    }

    const matchedVariant = variants.find(
      (v) => v?.sku && v.sku.trim() === selectedVariantSku
    )
    const variantSuffix = matchedVariant?.name
      ? ` - ${matchedVariant.name}`
      : ""
    const generatedAlt =
      locale === "ar"
        ? `صورة ${productName.trim()}${variantSuffix} رقم ${index + 1}`
        : `${productName.trim()}${variantSuffix} photo showcase ${index + 1}`

    setValue(`images.${index}.alt_text`, generatedAlt, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handlePrimaryChange = (checked: boolean) => {
    if (!checked || !isGeneralImage) return
    const allImages = getValues("images") || []
    allImages.forEach((_, i: number) => {
      setValue(`images.${i}.is_primary`, i === index, {
        shouldDirty: true,
        shouldValidate: true,
      })
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/10 p-4 sm:flex-row">
      {/* Preview */}
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background text-muted-foreground">
        <AspectRatio
          ratio={1 / 1}
          className="flex w-full items-center justify-center"
        >
          {hasImageError ? (
            <ImageOffIcon className="size-6 stroke-[1.5] text-destructive" />
          ) : currentUrl ? (
            <img
              key={currentUrl}
              src={currentUrl}
              alt={t("IMAGE_PREVIEW")}
              className="size-full object-cover"
              onLoad={() => setFailedUrl(null)}
              onError={() => setFailedUrl(currentUrl)}
            />
          ) : (
            <ImageIcon className="size-6 stroke-[1.5]" />
          )}
        </AspectRatio>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">
            {t("IMAGE_NUMBER", { number: index + 1 })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
            disabled={totalImages === 1}
            aria-label={t("REMOVE_IMAGE")}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>

        {/* Product Image Guidelines */}
        {index === 0 && (
          <div className="space-y-1 rounded-md border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-muted-foreground">
            <p className="font-medium text-foreground">
              {t("IMAGE_GUIDE_TITLE")}
            </p>
            <ul className="list-inside list-disc space-y-0.5 ps-1">
              <li>{t("IMAGE_GUIDE_SPECS")}</li>
              <li>{t("IMAGE_GUIDE_GENERAL")}</li>
              <li>{t("IMAGE_GUIDE_VARIANT")}</li>
            </ul>
          </div>
        )}

        {/* Image URL */}
        <Controller
          name={`images.${index}.url`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  setFailedUrl(null)
                  field.onChange(e)
                }}
                placeholder="https://example.com/images/product.jpg"
                className="h-8 text-xs"
                type="url"
                dir="ltr"
                aria-label={t("IMAGE_URL")}
              />
              {hasImageError && !fieldState.invalid && (
                <p className="text-[11px] text-destructive">
                  {t("IMAGE_LOAD_ERROR")}
                </p>
              )}
              {fieldState.invalid && (
                <ProductFieldError error={fieldState.error} />
              )}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {/* Link to Variant */}
          <Controller
            name={`images.${index}.variant_sku`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-xs">
                  {t("LINK_TO_VARIANT")}
                </FieldLabel>
                <Select
                  onValueChange={(val) => {
                    const variantSku = val === "none" ? "" : val
                    field.onChange(variantSku)
                    setImageVariantSku(index, variantSku, getValues, setValue)
                  }}
                  value={field.value || "none"}
                >
                  <SelectTrigger className="w-full text-xs data-[size=default]:h-7.5 ">
                    <SelectValue placeholder={t("LINK_TO_VARIANT")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("ALL_VARIANTS_GENERAL")}
                    </SelectItem>
                    {variants.map((v, i) => {
                      const currentSku = v?.sku?.trim() || ""
                      const currentName = v?.name?.trim() || ""
                      const isAlreadyUsed =
                        usedVariantSkus.includes(currentSku) &&
                        currentSku !== field.value

                      const attrSummary = v?.attributes
                        ? Object.values(v.attributes)
                            .filter(Boolean)
                            .join(" / ")
                        : ""

                      const displayLabel = currentName
                        ? `${currentName}${currentSku ? ` (${currentSku})` : ""}`
                        : attrSummary
                          ? `${attrSummary}${currentSku ? ` (${currentSku})` : ""}`
                          : currentSku
                            ? `SKU: ${currentSku}`
                            : `Variant #${i + 1}`

                      // Cannot link to a variant without an SKU
                      const itemValue = currentSku || `__no-sku-${i}`

                      return (
                        <SelectItem
                          key={i}
                          value={itemValue}
                          disabled={!currentSku || isAlreadyUsed}
                        >
                          {displayLabel}{" "}
                          {isAlreadyUsed ? `(${t("ALREADY_USED")})` : ""}
                          {!currentSku ? `(${t("ADD_SKU_FIRST")})` : ""}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          {/* Alt Text (accessibility) */}
          <Controller
            name={`images.${index}.alt_text`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs">
                  {t("IMAGE_ALT_TEXT")}
                </FieldLabel>
                <div className="relative flex items-center">
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder={t("IMAGE_ALT_TEXT")}
                    className="h-8 pe-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleGenerateImageAlt}
                    title={t("GENERATE_ALT_TEXT")}
                    aria-label={t("GENERATE_ALT_TEXT")}
                    className="absolute inset-e-1 size-6 cursor-pointer text-muted-foreground hover:text-primary"
                  >
                    <Wand2Icon className="size-3.5" />
                  </Button>
                </div>
                {fieldState.invalid && (
                  <ProductFieldError error={fieldState.error} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Set as primary product thumbnail */}
        <Controller
          name={`images.${index}.is_primary`}
          control={control}
          render={() => (
            <div className="flex items-center gap-2 pt-1">
              <Switch
                checked={isPrimary}
                onCheckedChange={handlePrimaryChange}
                // To change primary image, enable another general image
                disabled={!isGeneralImage || isPrimary}
                id={`primary-${index}`}
              />
              <label
                htmlFor={`primary-${index}`}
                className="cursor-pointer text-xs font-medium text-foreground"
              >
                {t("SET_PRIMARY_IMAGE")}
              </label>
            </div>
          )}
        />
      </div>
    </div>
  )
}

function VariantAttributesManager({
  attributes,
  onChange,
}: {
  attributes: Record<string, string>
  onChange: (attrs: Record<string, string>) => void
}) {
  const t = useTranslations("ProductForm")
  const [selectedKeyType, setSelectedKeyType] = React.useState<string>("color")
  const [customKey, setCustomKey] = React.useState("")
  const [attrVal, setAttrVal] = React.useState("")

  const isCustom = selectedKeyType === "custom"
  const addAttribute = () => {
    const finalKey = isCustom ? customKey.trim().toLowerCase() : selectedKeyType
    const finalVal = attrVal.trim()

    if (!finalKey || !finalVal) return

    onChange({
      ...attributes,
      [finalKey]: finalVal,
    })

    setAttrVal("")
    if (isCustom) setCustomKey("")
  }

  const removeAttribute = (key: string) => {
    const next = { ...attributes }
    delete next[key]
    onChange(next)
  }

  return (
    <div className="space-y-2.5 rounded-lg border border-border bg-muted/15 p-3">
      <div className="flex items-center justify-between">
        <FieldLabel className="text-xs font-semibold text-foreground">
          {t("VARIANT_ATTRIBUTES")}
        </FieldLabel>
        <span className="text-[11px] text-muted-foreground">
          {t("ATTRIBUTES_ADDED", {
            count: Object.keys(attributes || {}).length,
          })}
        </span>
      </div>

      {Object.keys(attributes || {}).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {Object.entries(attributes).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium shadow-xs transition-colors hover:border-muted-foreground/30"
            >
              <span className="text-muted-foreground uppercase">
                {PRESET_ATTRIBUTE_KEYS.includes(key)
                  ? t(`ATTRIBUTE_${key.toUpperCase()}` as never)
                  : key}
                :
              </span>
              <span className="font-semibold text-foreground">{value}</span>
              <button
                type="button"
                onClick={() => removeAttribute(key)}
                aria-label={`${t("REMOVE_ATTRIBUTE")}: ${key}`}
                className="ms-0.5 cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Select attribute */}
        <Select
          value={selectedKeyType}
          onValueChange={(val) => {
            setSelectedKeyType(val)
          }}
        >
          <SelectTrigger className="h-8 w-36 bg-background text-xs">
            <SelectValue placeholder={t("SELECT_ATTRIBUTE")} />
          </SelectTrigger>
          <SelectContent>
            {PRESET_ATTRIBUTE_KEYS.map((key) => (
              <SelectItem key={key} value={key} className="text-xs">
                {t(`ATTRIBUTE_${key.toUpperCase()}`)}
              </SelectItem>
            ))}
            <SelectItem
              value="custom"
              className="text-xs font-medium text-primary"
            >
              {t("CUSTOM_ATTRIBUTE")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Attribute name... */}
        {isCustom && (
          <Input
            placeholder={t("ATTRIBUTE_NAME_PLACEHOLDER")}
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addAttribute()
              }
            }}
            className="h-8 w-32 bg-background text-xs"
            autoFocus
          />
        )}

        {/* Value... */}
        <Input
          placeholder={t("ATTRIBUTE_VALUE_PLACEHOLDER")}
          value={attrVal}
          onChange={(e) => setAttrVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addAttribute()
            }
          }}
          className="h-8 min-w-30 flex-1 bg-background text-xs"
        />

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addAttribute}
          className="h-8 shrink-0 cursor-pointer px-3 text-xs"
        >
          <PlusIcon className="me-1 size-3.5" />
          {t("ADD")}
        </Button>
      </div>
      {attrVal.trim() && (
        <p className="text-[11px] text-amber-600 dark:text-amber-500">
          {t("ATTRIBUTE_PENDING_HINT")}
        </p>
      )}
    </div>
  )
}
