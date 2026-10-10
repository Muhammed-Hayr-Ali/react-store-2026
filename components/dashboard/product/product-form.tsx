/**
 * @file components/dashboard/product/product-form.tsx
 * @description Form component for creating and updating products, variants, and media.
 * React 19 / Compiler compliant (Zero Cascading Renders, Single Source of Truth).
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
} from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import slugify from "slugify"
import {
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

import { createProduct } from "@/lib/actions/products/mutations/create"
import { updateProduct } from "@/lib/actions/products/mutations/update"
import {
  CreateProductCompleteInput,
  ProductWithRelations,
} from "@/lib/actions/products/types"
import { Category } from "@/lib/actions/categories"
import { Brand } from "@/lib/actions/brands"

import { CategoryFormSheet } from "@/components/dashboard/categories/category-form-sheet"
import { DeleteCategoryDialog } from "@/components/dashboard/categories/delete-category-dialog"

import BrandForm from "@/components/dashboard/brand/brand-form-sheet"
import DeleteBrandDialog from "../brand/delete-brand"
import { createProductCompleteSchema } from "@/lib/actions/products"
import { appRoutes } from "@/lib/config/app-routes"

type FormValues = CreateProductCompleteInput

const DEFAULT_VARIANT = {
  sku: "",
  name: "",
  attributes: {},
  price: 0,
  compare_at_price: null,
  stock_quantity: 0,
  track_inventory: true,
  low_stock_threshold: 5,
  is_active: true,
  sort_order: 1,
}

const DEFAULT_IMAGE = {
  url: "",
  alt_text: "",
  is_primary: true,
  variant_sku: "",
}

const PRESET_ATTRIBUTE_KEYS = [
  { label: "Color", value: "color", placeholder: "e.g., Red or #FF0000" },
  { label: "Weight", value: "weight", placeholder: "e.g., 250g or 1kg" },
  { label: "Size", value: "size", placeholder: "e.g., Medium or 42" },
  {
    label: "Flavor",
    value: "flavor",
    placeholder: "e.g., Barbecue or Vanilla",
  },
  {
    label: "Material",
    value: "material",
    placeholder: "e.g., Cotton or Plastic",
  },
]

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
  brands: Brand[] | null
}

export default function ProductForm({
  product,
  categories: initialCategories,
  brands: initialBrands,
}: ProductFormProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const isEditing = Boolean(product)

  // Single Source of Truth: Derived directly from server props without state mirroring or useEffect
  const categoriesList = initialCategories || []
  const brandsList = initialBrands || []

  const [brandModal, setBrandModal] = React.useState<{
    type: "create" | "update" | "delete" | null
    data: Brand | null
  }>({
    type: null,
    data: null,
  })

  const initialImages = React.useMemo(() => {
    if (!product?.product_images || product.product_images.length === 0) {
      return [DEFAULT_IMAGE]
    }
    return product.product_images.map((img) => {
      const linkedVariant = product.product_variants.find(
        (v) => v.id === img.variant_id
      )
      return {
        url: img.url,
        alt_text: img.alt_text || "",
        is_primary: img.is_primary,
        variant_sku: linkedVariant?.sku || "",
      }
    })
  }, [product])

  const initialVariants = React.useMemo(() => {
    if (!product?.product_variants || product.product_variants.length === 0) {
      return [DEFAULT_VARIANT]
    }
    return product.product_variants.map((v, idx) => ({
      sku: v.sku,
      name: v.name || "",
      attributes: v.attributes || {},
      price: v.price / 100,
      compare_at_price: v.compare_at_price ? v.compare_at_price / 100 : null,
      stock_quantity: v.stock_quantity,
      track_inventory: v.track_inventory,
      low_stock_threshold: v.low_stock_threshold,
      is_active: v.is_active,
      sort_order: v.sort_order || idx + 1,
    }))
  }, [product])

  const form = useForm<FormValues>({
    resolver: zodResolver(createProductCompleteSchema),
    mode: "onChange",
    shouldFocusError: false,
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      category_id: product?.category_id || "",
      brand_id: product?.brand_id || null,
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
    formState: { isSubmitting },
    control,
    setValue,
    getFieldState,
  } = form

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  })

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
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
      setErrorMessage(
        "Please enter a product name before generating SEO details."
      )
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    setErrorMessage(null)

    const brandSuffix = selectedBrandObject
      ? ` | ${selectedBrandObject.name}`
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
      const categoryPart = selectedCategoryObject
        ? ` in ${selectedCategoryObject.name}`
        : ""
      const brandPart = selectedBrandObject
        ? ` by ${selectedBrandObject.name}`
        : ""
      generatedDescription =
        `Shop ${currentProductName.trim()}${brandPart}${categoryPart}. High quality at the best prices with fast and reliable delivery.`.slice(
          0,
          160
        )
    }

    setValue("meta_title", generatedTitle, {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue("meta_description", generatedDescription, {
      shouldValidate: true,
      shouldDirty: true,
    })
    toast.success("SEO details generated successfully!")
  }

  async function onSubmit(data: FormValues) {
    setErrorMessage(null)

    const payload: CreateProductCompleteInput = {
      ...data,
      brand_id: data.brand_id || null,
      description: data.description || null,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      variants: data.variants.map((v, idx) => ({
        ...v,
        name: v.name || "",
        attributes: v.attributes || {},
        sort_order: idx + 1,
        compare_at_price:
          v.compare_at_price !== null && v.compare_at_price !== undefined
            ? Number(v.compare_at_price)
            : null,
      })),
      images: data.images.map((img) => ({
        ...img,
        alt_text: img.alt_text || "",
        variant_sku: img.variant_sku || "",
      })),
    }

    let result
    if (isEditing && product) {
      result = await updateProduct(product.id, payload)
    } else {
      result = await createProduct(payload)
    }

    if (result.success) {
      toast.success(
        isEditing
          ? "Product updated successfully!"
          : "Product created successfully!"
      )
      router.push(appRoutes.dashboard.admin.products)
      router.refresh()
    } else {
      console.error("Submission Error:", result)
      const errorMsg =
        result.error === "VALIDATION_ERROR"
          ? "Please check the form for invalid inputs."
          : result.error === "SLUG_ALREADY_EXISTS"
            ? "The URL slug is already taken. Please choose another one."
            : result.error === "SKU_ALREADY_EXISTS"
              ? "One or more SKUs are already in use. Please generate or enter unique SKUs."
              : result.error ||
                (isEditing
                  ? "Failed to update product."
                  : "Failed to create product.")

      setErrorMessage(errorMsg)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const onInvalid = () => {
    setErrorMessage(
      "Please complete all required fields and resolve the errors below before submitting."
    )
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-6"
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
              aria-label="Close error alert"
            >
              <XIcon className="size-4" />
            </button>
          </Alert>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <PackageIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    Basic Information
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Define primary product identity and general presentation
                    details
                  </p>
                </div>
              </div>

              <FieldGroup className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="product-name" className="text-xs">
                          Product Name{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="product-name"
                          placeholder="e.g., Premium Oxford Cotton Shirt"
                          className="h-9 text-xs"
                          onChange={(e) => {
                            field.onChange(e)
                            const slugState = getFieldState("slug")
                            if (!slugState.isDirty) {
                              setValue("slug", generateSlug(e.target.value), {
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
                    name="slug"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="product-slug" className="text-xs">
                          URL Slug <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="product-slug"
                          placeholder="premium-oxford-cotton-shirt"
                          className="h-9 font-mono text-xs"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

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
                          Description
                        </FieldLabel>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
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
                          placeholder="Provide a detailed description of the product features..."
                          rows={4}
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

            {/* Variants & Pricing */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <LayersIcon className="size-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-card-foreground">
                      Variants & Pricing
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Manage prices, SKUs, and stock quantities
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
                  Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {variantFields.map((field, index) => (
                  <VariantCard
                    key={field.id}
                    index={index}
                    control={control}
                    setValue={setValue}
                    totalVariants={variantFields.length}
                    onRemove={() => removeVariant(index)}
                  />
                ))}
              </div>
            </div>

            {/* Media Gallery */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-card-foreground">
                      Media Gallery
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Link images to variants or set primary image
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
                  Add Image
                </Button>
              </div>

              <div className="space-y-4">
                {imageFields.map((field, index) => (
                  <ImageCard
                    key={field.id}
                    index={index}
                    control={control}
                    setValue={setValue}
                    totalImages={imageFields.length}
                    onRemove={() => removeImage(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="min-w-0 space-y-6 lg:col-span-1">
            {/* Status Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <SparklesIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    Product Status
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Store availability and visibility state
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/15 p-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold">Active</span>
                        <p className="text-[11px] text-muted-foreground">
                          Visible and available for purchase
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />

                <Controller
                  name="is_featured"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/15 p-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold">Featured</span>
                        <p className="text-[11px] text-muted-foreground">
                          Showcase in store highlights
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

            {/* Organization Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                <TagIcon className="size-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-card-foreground">
                    Organization
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Structure catalog taxonomy and branding
                  </p>
                </div>
              </div>

              <FieldGroup className="space-y-3.5">
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs">
                        Category <span className="text-destructive">*</span>
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
                            className="h-8 flex-1 text-xs"
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              -- Select category --
                            </SelectItem>
                            {categoriesList.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Uncontrolled CategoryFormSheet Trigger: Create */}
                        <CategoryFormSheet
                          parentOptions={categoriesList}
                          onSuccess={() => router.refresh()}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            title="Create Category"
                            className="h-7 w-7 shrink-0 cursor-pointer p-0"
                          >
                            <PlusIcon className="size-3" />
                          </Button>
                        </CategoryFormSheet>

                        {selectedCategoryObject && (
                          <>
                            {/* Uncontrolled CategoryFormSheet Trigger: Edit */}
                            <CategoryFormSheet
                              category={selectedCategoryObject}
                              parentOptions={categoriesList}
                              onSuccess={() => router.refresh()}
                            >
                              <Button
                                type="button"
                                variant="outline"
                                title="Edit selected category"
                                className="h-7 w-7 shrink-0 cursor-pointer p-0 text-muted-foreground hover:text-foreground"
                              >
                                <PencilIcon className="size-3" />
                              </Button>
                            </CategoryFormSheet>

                            {/* Uncontrolled DeleteCategoryDialog Trigger */}
                            <DeleteCategoryDialog
                              categoryId={selectedCategoryObject.id}
                              categoryName={selectedCategoryObject.name}
                              onDeleted={(deletedId) => {
                                if (
                                  form.getValues("category_id") === deletedId
                                ) {
                                  setValue("category_id", "", {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  })
                                }
                                router.refresh()
                              }}
                            >
                              <Button
                                type="button"
                                variant="outline"
                                title="Delete selected category"
                                className="h-7 w-7 shrink-0 cursor-pointer p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2Icon className="size-3" />
                              </Button>
                            </DeleteCategoryDialog>
                          </>
                        )}
                      </div>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="brand_id"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs">
                        Brand (Optional)
                      </FieldLabel>

                      <div className="flex items-center gap-1.5">
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === "none" ? null : val)
                          }
                          value={field.value ?? "none"}
                        >
                          <SelectTrigger className="h-8 flex-1 text-xs">
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- No brand --</SelectItem>
                            {brandsList.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setBrandModal({ type: "create", data: null })
                          }
                          title="Create Brand"
                          className="h-7 w-7 shrink-0 cursor-pointer p-0"
                        >
                          <PlusIcon className="size-3" />
                        </Button>

                        {selectedBrandObject && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setBrandModal({
                                  type: "update",
                                  data: selectedBrandObject,
                                })
                              }
                              title="Edit selected brand"
                              className="h-7 w-7 shrink-0 cursor-pointer p-0 text-muted-foreground hover:text-foreground"
                            >
                              <PencilIcon className="size-3" />
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setBrandModal({
                                  type: "delete",
                                  data: selectedBrandObject,
                                })
                              }
                              title="Delete selected brand"
                              className="h-7 w-7 shrink-0 cursor-pointer p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2Icon className="size-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {/* SEO Details Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <GlobeIcon className="size-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold text-card-foreground">
                      SEO Details
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Search engine listing previews
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
                  Generate SEO
                </Button>
              </div>

              <FieldGroup className="space-y-3.5">
                <Controller
                  name="meta_title"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="meta-title" className="text-xs">
                          Meta Title
                        </FieldLabel>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {(field.value ?? "").length}/70
                        </span>
                      </div>
                      <Input
                        {...field}
                        id="meta-title"
                        value={field.value ?? ""}
                        placeholder="Page title in search results"
                        className="h-9 text-xs"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

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
                          Meta Description
                        </FieldLabel>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
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
                          placeholder="Brief summary for search engines..."
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

            {/* Actions Card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 border-b border-border/60 pb-3">
                <h2 className="text-sm font-semibold text-card-foreground">
                  Actions
                </h2>
                <p className="text-xs text-muted-foreground">
                  Commit or cancel ongoing modifications
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-col">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 w-full cursor-pointer text-xs shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      Saving...
                    </>
                  ) : (
                    <>{isEditing ? "Update Product" : "Save Product"}</>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.back()}
                  className="h-9 w-full text-xs"
                >
                  Discard Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Brand Modals */}
      <BrandForm
        isOpen={brandModal.type === "create" ? "create" : null}
        onOpenChange={(open) => {
          if (!open) setBrandModal({ type: null, data: null })
        }}
        item={null}
        onSuccess={(newBrand) => {
          setValue("brand_id", newBrand.id, {
            shouldValidate: true,
            shouldDirty: true,
          })
          setBrandModal({ type: null, data: null })
          router.refresh()
        }}
      />

      <BrandForm
        isOpen={brandModal.type === "update" ? "update" : null}
        onOpenChange={(open) => {
          if (!open) setBrandModal({ type: null, data: null })
        }}
        item={brandModal.data}
        onSuccess={() => {
          setBrandModal({ type: null, data: null })
          router.refresh()
        }}
      />

      <DeleteBrandDialog
        isOpen={brandModal.type === "delete"}
        onOpenChange={(open) => {
          if (!open) setBrandModal({ type: null, data: null })
        }}
        item={brandModal.data}
        onSuccess={(deletedId) => {
          if (form.getValues("brand_id") === deletedId) {
            setValue("brand_id", null, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          setBrandModal({ type: null, data: null })
          router.refresh()
          toast.success("Brand deleted successfully!")
        }}
      />
    </>
  )
}

interface VariantCardProps {
  index: number
  control: Control<FormValues>
  setValue: UseFormSetValue<FormValues>
  totalVariants: number
  onRemove: () => void
}

function VariantCard({
  index,
  control,
  setValue,
  totalVariants,
  onRemove,
}: VariantCardProps) {
  const variantName = useWatch({ control, name: `variants.${index}.name` })
  const productName = useWatch({ control, name: "name" })

  const handleGenerateSku = () => {
    const newSku = generateRandomSku(productName, variantName)
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
            {variantName || `Variant #${index + 1}`}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
          disabled={totalVariants === 1}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          name={`variants.${index}.sku`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                SKU Code <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative flex items-center">
                <Input
                  {...field}
                  placeholder="e.g., SHIRT-WHT-MD"
                  className="h-8 pe-8 text-xs uppercase"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleGenerateSku}
                  title="Generate SKU"
                  className="absolute inset-e-1 size-6 cursor-pointer text-muted-foreground hover:text-primary"
                >
                  <Wand2Icon className="size-3.5" />
                </Button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name={`variants.${index}.name`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                Variant Name (Optional)
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="e.g., White / Medium"
                className="h-8 text-xs"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Controller
          name={`variants.${index}.price`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                Price <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                type="number"
                step="0.01"
                min="0"
                className="h-8 text-xs"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name={`variants.${index}.compare_at_price`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">Compare-at Price</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional"
                className="h-8 text-xs"
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name={`variants.${index}.stock_quantity`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xs">
                Stock Quantity <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                type="number"
                min="0"
                className="h-8 text-xs"
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="mt-3 pt-1">
        <Controller
          name={`variants.${index}.attributes`}
          control={control}
          render={({ field }) => (
            <VariantAttributesManager
              attributes={field.value || {}}
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
  totalImages: number
  onRemove: () => void
}

function ImageCard({
  index,
  control,
  setValue,
  totalImages,
  onRemove,
}: ImageCardProps) {
  const currentUrl = useWatch({ control, name: `images.${index}.url` })
  const variants = useWatch({ control, name: "variants" }) || []
  const productName = useWatch({ control, name: "name" }) || ""
  const selectedVariantSku = useWatch({
    control,
    name: `images.${index}.variant_sku`,
  })

  const handleGenerateImageAlt = () => {
    if (!productName.trim()) {
      toast.error("Please enter the product name first")
      return
    }

    const matchedVariant = variants.find(
      (v) => v?.sku && v.sku.trim() === selectedVariantSku
    )
    const variantSuffix = matchedVariant?.name
      ? ` - ${matchedVariant.name}`
      : ""
    const generatedAlt = `${productName.trim()}${variantSuffix} photo showcase ${index + 1}`

    setValue(`images.${index}.alt_text`, generatedAlt, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/10 p-4 sm:flex-row">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background text-muted-foreground">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Preview"
            className="size-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        ) : (
          <ImageIcon className="size-6 stroke-[1.5]" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Image #{index + 1}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
            disabled={totalImages === 1}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>

        <Controller
          name={`images.${index}.url`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="https://example.com/images/product.jpg"
                className="h-8 text-xs"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Controller
            name={`images.${index}.alt_text`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs">
                  Alt Text (accessibility)
                </FieldLabel>
                <div className="relative flex items-center">
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Alt Text (accessibility)"
                    className="h-8 pe-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleGenerateImageAlt}
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
            name={`images.${index}.variant_sku`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel className="text-xs">Link to Variant</FieldLabel>
                <Select
                  onValueChange={(val) =>
                    field.onChange(val === "none" ? "" : val)
                  }
                  value={field.value || "none"}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Link to variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Variants (General)</SelectItem>
                    {variants.map((v, i) => {
                      const currentSku = v?.sku?.trim()
                      const currentName = v?.name?.trim()

                      const attrSummary = v?.attributes
                        ? Object.values(v.attributes)
                            .filter(Boolean)
                            .join(" / ")
                        : ""

                      const displayLabel = currentName
                        ? `${currentName}${currentSku ? ` (\${currentSku})` : ""}`
                        : attrSummary
                          ? `${attrSummary}${currentSku ? ` (\${currentSku})` : ""}`
                          : currentSku
                            ? `SKU: ${currentSku}`
                            : `Variant #${i + 1}`

                      return (
                        <SelectItem
                          key={i}
                          value={currentSku || `variant-${i}`}
                        >
                          {displayLabel}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <Controller
          name={`images.${index}.is_primary`}
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2 pt-1">
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id={`primary-${index}`}
              />
              <label
                htmlFor={`primary-${index}`}
                className="cursor-pointer text-xs font-medium text-foreground"
              >
                Set as primary product thumbnail
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
  const [selectedKeyType, setSelectedKeyType] = React.useState<string>("color")
  const [customKey, setCustomKey] = React.useState("")
  const [attrVal, setAttrVal] = React.useState("")

  const isCustom = selectedKeyType === "custom"
  const currentPreset = PRESET_ATTRIBUTE_KEYS.find(
    (item) => item.value === selectedKeyType
  )

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
          Variant Attributes (e.g., Color, Size, Weight)
        </FieldLabel>
        <span className="text-[11px] text-muted-foreground">
          {Object.keys(attributes || {}).length} added
        </span>
      </div>

      {Object.keys(attributes || {}).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {Object.entries(attributes).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium shadow-xs transition-colors hover:border-muted-foreground/30"
            >
              <span className="text-muted-foreground uppercase">{key}:</span>
              <span className="font-semibold text-foreground">{value}</span>
              <button
                type="button"
                onClick={() => removeAttribute(key)}
                className="ml-0.5 cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Select
          value={selectedKeyType}
          onValueChange={(val) => {
            setSelectedKeyType(val)
          }}
        >
          <SelectTrigger className="h-8 w-36 bg-background text-xs">
            <SelectValue placeholder="Select attribute" />
          </SelectTrigger>
          <SelectContent>
            {PRESET_ATTRIBUTE_KEYS.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="text-xs"
              >
                {item.label}
              </SelectItem>
            ))}
            <SelectItem
              value="custom"
              className="text-xs font-medium text-primary"
            >
              + Custom...
            </SelectItem>
          </SelectContent>
        </Select>

        {isCustom && (
          <Input
            placeholder="Attribute name..."
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            className="h-8 w-32 bg-background text-xs"
            autoFocus
          />
        )}

        <Input
          placeholder={currentPreset ? currentPreset.placeholder : "Value..."}
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
          <PlusIcon className="mr-1 size-3.5" />
          Add
        </Button>
      </div>
    </div>
  )
}
