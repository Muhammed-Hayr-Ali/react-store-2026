"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useFieldArray } from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import slugify from "slugify"
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createProduct } from "@/lib/actions/products/mutations/create"
import {
  createProductCompleteSchema,
  CreateProductCompleteInput,
} from "@/lib/actions/products/types"
import { Category } from "@/lib/actions/categories"
import { Brand } from "@/lib/actions/brands"

type FormValues = CreateProductCompleteInput

function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    replacement: "-",
    trim: true,
  })
}

function VariantAttributesManager({
  attributes,
  onChange,
}: {
  attributes: Record<string, string>
  onChange: (attrs: Record<string, string>) => void
}) {
  const [attrKey, setAttrKey] = React.useState("")
  const [attrVal, setAttrVal] = React.useState("")

  const addAttribute = () => {
    if (!attrKey.trim() || !attrVal.trim()) return
    onChange({
      ...attributes,
      [attrKey.trim().toLowerCase()]: attrVal.trim(),
    })
    setAttrKey("")
    setAttrVal("")
  }

  const removeAttribute = (key: string) => {
    const next = { ...attributes }
    delete next[key]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <FieldLabel className="text-xs font-medium text-muted-foreground">
        خصائص المتغير (مثل: color, size)
      </FieldLabel>
      <div className="flex flex-wrap gap-2">
        {Object.entries(attributes || {}).map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            <span>{key}:</span>
            <span className="font-semibold">{value}</span>
            <button
              type="button"
              onClick={() => removeAttribute(key)}
              className="ms-1 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="الخاصية (مثال: color)"
          value={attrKey}
          onChange={(e) => setAttrKey(e.target.value)}
          className="h-8 text-xs"
        />
        <Input
          placeholder="القيمة (مثال: red)"
          value={attrVal}
          onChange={(e) => setAttrVal(e.target.value)}
          className="h-8 text-xs"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addAttribute}
          className="h-8 px-3 text-xs"
        >
          إضافة
        </Button>
      </div>
    </div>
  )
}

interface CreateProductFormProps {
  categories: Category[] | null
  brands: Brand[] | null
}

export default function CreateProductForm({
  categories,
  brands,
}: CreateProductFormProps) {
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(createProductCompleteSchema),
    defaultValues: {
      name: "",
      slug: "",
      category_id: "",
      brand_id: null,
      description: null,
      meta_title: null,
      meta_description: null,
      is_active: true,
      is_featured: false,
      variants: [
        {
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
        },
      ],
      images: [
        {
          url: "",
          alt_text: "",
          is_primary: true,
          variant_sku: "",
        },
      ],
    },
  })

  const {
    formState: { isSubmitting, errors },
    control,
    watch,
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

  const nameValue = watch("name")
  React.useEffect(() => {
    const slugState = getFieldState("slug")
    if (nameValue && !slugState.isDirty) {
      setValue("slug", generateSlug(nameValue), {
        shouldValidate: true,
      })
    }
  }, [nameValue, setValue, getFieldState])

  const descriptionValue = watch("description") || ""

  async function onSubmit(data: FormValues) {
    const payload: CreateProductCompleteInput = {
      ...data,
      brand_id: data.brand_id ? data.brand_id : null,
      description: data.description ? data.description : null,
      meta_title: data.meta_title ? data.meta_title : null,
      meta_description: data.meta_description ? data.meta_description : null,
      variants: data.variants.map((v, idx) => ({
        ...v,
        name: v.name || "",
        attributes: v.attributes || {},
        sort_order: idx + 1,
        compare_at_price:
          v.compare_at_price !== undefined && v.compare_at_price !== null
            ? Number(v.compare_at_price)
            : null,
      })),
      images: data.images.map((img) => ({
        ...img,
        alt_text: img.alt_text || "",
        variant_sku: img.variant_sku || "",
      })),
    }

    const result = await createProduct(payload)

    if (result.success) {
      toast.success("تم إنشاء المنتج بنجاح!")
      router.refresh()
    } else {
      console.error("Creation Error:", result)
      const errorMsg =
        result.error === "VALIDATION_ERROR"
          ? "يرجى التحقق من صحة البيانات المدخلة."
          : result.error === "SLUG_ALREADY_EXISTS"
            ? "الرابط (Slug) مستخدم بالفعل."
            : result.error || "فشل في إنشاء المنتج."
      toast.error(errorMsg)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-6">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">إضافة منتج جديد</h1>
        <p className="text-sm text-muted-foreground">
          أدخل تفاصيل المنتج، المتغيرات، والصور لإضافته مباشرة إلى المتجر.
        </p>
      </div>

      <form
        id="create-product-page-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* القسم 1: المعلومات الأساسية */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
              1
            </span>
            المعلومات الأساسية
          </h2>

          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-name">اسم المنتج *</FieldLabel>
                    <Input
                      {...field}
                      id="product-name"
                      placeholder="مثال: قميص قطني فاخر"
                      aria-invalid={fieldState.invalid}
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
                    <FieldLabel htmlFor="product-slug">
                      الرابط (Slug) *
                    </FieldLabel>
                    <Input
                      {...field}
                      id="product-slug"
                      placeholder="cotton-shirt"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="category_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>التصنيف *</FieldLabel>
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === "none" ? "" : val)
                      }
                      value={field.value || "none"}
                    >
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="اختر تصنيفاً" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- اختر تصنيفاً --</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                            {cat.name_ar && (
                              <span className="ms-1 text-muted-foreground">
                                - {cat.name_ar}
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
                name="brand_id"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>العلامة التجارية (اختياري)</FieldLabel>
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === "none" ? null : val)
                      }
                      value={field.value ?? "none"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر علامة تجارية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          -- بدون علامة تجارية --
                        </SelectItem>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                            {brand.name_ar && (
                              <span className="ms-1 text-muted-foreground">
                                - {brand.name_ar}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-description">
                    وصف المنتج
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="product-description"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? e.target.value : null)
                      }
                      placeholder="اكتب وصفاً تفصيلياً للمنتج ومميزاته..."
                      rows={3}
                      className="min-h-20 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText>
                        {descriptionValue.length} أحرف
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="meta_title"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="meta-title">
                      عنوان سيو (Meta Title)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="meta-title"
                      value={field.value ?? ""}
                      placeholder="عنوان جذاب لمحركات البحث"
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
                    <FieldLabel htmlFor="meta-description">
                      وصف سيو (Meta Description)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="meta-description"
                      value={field.value ?? ""}
                      placeholder="وصف مختصر للظهور في محركات البحث"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </div>

        <Separator />

        {/* القسم 2: المتغيرات */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                2
              </span>
              متغيرات المنتج ({variantFields.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendVariant({
                  sku: "",
                  name: "",
                  attributes: {},
                  price: 0,
                  compare_at_price: null,
                  stock_quantity: 0,
                  track_inventory: true,
                  low_stock_threshold: 5,
                  is_active: true,
                  sort_order: variantFields.length + 1,
                })
              }
              className="gap-2"
            >
              <PlusIcon className="size-4" />
              إضافة متغير
            </Button>
          </div>

          {variantFields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 rounded-lg bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">متغير #{index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10"
                  onClick={() => removeVariant(index)}
                  disabled={variantFields.length === 1}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Controller
                  name={`variants.${index}.sku`}
                  control={control}
                  render={({ field: f, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>رمز التخزين SKU *</FieldLabel>
                      <Input {...f} placeholder="مثال: DEMO-RED-L" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name={`variants.${index}.name`}
                  control={control}
                  render={({ field: f, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>اسم المتغير (اختياري)</FieldLabel>
                      <Input
                        {...f}
                        value={f.value ?? ""}
                        placeholder="مثال: أحمر - كبير"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Controller
                  name={`variants.${index}.price`}
                  control={control}
                  render={({ field: f, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>السعر *</FieldLabel>
                      <Input
                        {...f}
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) => f.onChange(Number(e.target.value))}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name={`variants.${index}.compare_at_price`}
                  control={control}
                  render={({ field: f, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>السعر قبل الخصم</FieldLabel>
                      <Input
                        {...f}
                        value={f.value ?? ""}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="اختياري"
                        onChange={(e) =>
                          f.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name={`variants.${index}.stock_quantity`}
                  control={control}
                  render={({ field: f, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>المخزون المتوفر *</FieldLabel>
                      <Input
                        {...f}
                        type="number"
                        min="0"
                        onChange={(e) => f.onChange(Number(e.target.value))}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name={`variants.${index}.attributes`}
                control={control}
                render={({ field: f }) => (
                  <VariantAttributesManager
                    attributes={f.value || {}}
                    onChange={f.onChange}
                  />
                )}
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* القسم 3: الصور */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                3
              </span>
              معرض الصور ({imageFields.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendImage({
                  url: "",
                  alt_text: "",
                  is_primary: false,
                  variant_sku: "",
                })
              }
              className="gap-2"
            >
              <PlusIcon className="size-4" />
              إضافة صورة
            </Button>
          </div>

          {imageFields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 rounded-lg bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">صورة #{index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10"
                  onClick={() => removeImage(index)}
                  disabled={imageFields.length === 1}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Controller
                  name={`images.${index}.url`}
                  control={control}
                  render={({ field: f, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>رابط الصورة *</FieldLabel>
                      <Input
                        {...f}
                        value={f.value ?? ""}
                        placeholder="https://example.com/photo.jpg"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Controller
                    name={`images.${index}.alt_text`}
                    control={control}
                    render={({ field: f, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>النص البديل</FieldLabel>
                        <Input
                          {...f}
                          value={f.value ?? ""}
                          placeholder="وصف محتوى الصورة"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name={`images.${index}.variant_sku`}
                    control={control}
                    render={({ field: f, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>ربط بمتغير (SKU)</FieldLabel>
                        <Select
                          onValueChange={(val) =>
                            f.onChange(val === "none" ? "" : val)
                          }
                          value={f.value || "none"}
                        >
                          <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="صورة عامة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              صورة عامة للمنتج (غير مرتبطة بمتغير)
                            </SelectItem>
                            {variantFields.map((v, i) => {
                              const currentSku = watch(`variants.${i}.sku`)
                              return (
                                <SelectItem
                                  key={v.id}
                                  value={currentSku || `variant-${i}`}
                                >
                                  {currentSku
                                    ? `المتغير: ${currentSku}`
                                    : `متغير ${i + 1}`}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name={`images.${index}.is_primary`}
                  control={control}
                  render={({ field: f }) => (
                    <Field className="flex items-center gap-2 pt-1">
                      <Switch
                        checked={f.value}
                        onCheckedChange={f.onChange}
                        id={`primary-${index}`}
                      />
                      <label
                        htmlFor={`primary-${index}`}
                        className="cursor-pointer text-sm font-medium"
                      >
                        صورة غلاف رئيسية
                      </label>
                    </Field>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* القسم 4: حالة العرض */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
              4
            </span>
            حالة العرض
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Field className="flex flex-row items-center justify-between rounded-lg bg-muted/20 p-4">
                  <div className="space-y-0.5">
                    <FieldLabel>منتج نشط</FieldLabel>
                    <p className="text-xs text-muted-foreground">
                      المنتج ظاهر ومتاح للشراء في المتجر
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />

            <Controller
              name="is_featured"
              control={control}
              render={({ field }) => (
                <Field className="flex flex-row items-center justify-between rounded-lg bg-muted/20 p-4">
                  <div className="space-y-0.5">
                    <FieldLabel>منتج مميز</FieldLabel>
                    <p className="text-xs text-muted-foreground">
                      عرض المنتج في واجهة المتجر الرئيسية
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
          </div>
        </div>

        {errors.root && (
          <FieldError
            errors={[{ message: errors.root.message || "حدث خطأ غير متوقع" }]}
          />
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => form.reset()}
          >
            إعادة تعيين
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? <Spinner className="me-2" /> : "إنشاء المنتج"}
          </Button>
        </div>
      </form>
    </div>
  )
}
