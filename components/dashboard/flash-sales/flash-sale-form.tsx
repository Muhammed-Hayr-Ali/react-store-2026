"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import {
  CalendarIcon,
  CheckCircle2Icon,
  CheckIcon,
  FlameIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { flashSaleFormSchema } from "@/lib/actions/flash-sales/schemas"
import {
  FlashSaleDiscountType,
  FlashSaleFormInput,
} from "@/lib/actions/flash-sales/types"
import { createFlashSale } from "@/lib/actions/flash-sales/mutations/create"
import { updateFlashSale } from "@/lib/actions/flash-sales/mutations/update"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { appRoutes } from "@/lib/config/app-routes"

export interface SelectableProduct {
  id: string
  name: string
  slug: string
  price: number
  primary_image_url?: string | null
}

interface FlashSaleFormProps {
  availableProducts: SelectableProduct[]
  initialData?: FlashSaleFormInput
  saleId?: string
  onSuccessRedirect?: string
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getPreviewPrice(
  originalPrice: number,
  discountType: FlashSaleDiscountType,
  discountValue?: number | null
): number {
  if (discountType === "none" || !discountValue || discountValue <= 0) {
    return originalPrice
  }
  if (discountType === "percentage") {
    return Math.max(0, originalPrice - (originalPrice * discountValue) / 100)
  }
  if (discountType === "fixed_amount") {
    return Math.max(0, originalPrice - discountValue)
  }
  if (discountType === "fixed_price") {
    return Math.max(0, discountValue)
  }
  return originalPrice
}

export function FlashSaleForm({
  availableProducts,
  initialData,
  saleId,
  onSuccessRedirect = appRoutes.dashboard.admin.flashSales,
}: FlashSaleFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [productSearchOpen, setProductSearchOpen] = React.useState(false)

  const now = new Date()
  const defaultStartsAt = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16)
  const defaultEndsAt = new Date(
    now.getTime() + 48 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FlashSaleFormInput>({
    resolver: zodResolver(flashSaleFormSchema),
    shouldFocusError: false,
    defaultValues: initialData || {
      title: "",
      titleAr: "",
      slug: "",
      description: "",
      startsAt: defaultStartsAt,
      endsAt: defaultEndsAt,
      isActive: true,
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = useWatch({ control, name: "items" })
  const isActive = useWatch({ control, name: "isActive" })
  const startsAt = useWatch({ control, name: "startsAt" })
  const endsAt = useWatch({ control, name: "endsAt" })

  const dateRange: DateRange | undefined = React.useMemo(() => {
    const from = startsAt ? new Date(startsAt) : undefined
    const to = endsAt ? new Date(endsAt) : undefined
    return {
      from: from && !isNaN(from.getTime()) ? from : undefined,
      to: to && !isNaN(to.getTime()) ? to : undefined,
    }
  }, [startsAt, endsAt])

  const startTime =
    startsAt && startsAt.length >= 16 ? startsAt.slice(11, 16) : "00:00"
  const endTime = endsAt && endsAt.length >= 16 ? endsAt.slice(11, 16) : "23:59"

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const year = range.from.getFullYear()
      const month = String(range.from.getMonth() + 1).padStart(2, "0")
      const day = String(range.from.getDate()).padStart(2, "0")
      setValue("startsAt", `${year}-${month}-${day}T${startTime}`, {
        shouldValidate: true,
      })
    }

    if (range?.to) {
      const year = range.to.getFullYear()
      const month = String(range.to.getMonth() + 1).padStart(2, "0")
      const day = String(range.to.getDate()).padStart(2, "0")
      setValue("endsAt", `${year}-${month}-${day}T${endTime}`, {
        shouldValidate: true,
      })
    }
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    const datePart =
      startsAt && startsAt.length >= 10
        ? startsAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    setValue("startsAt", `${datePart}T${time}`, { shouldValidate: true })
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    const datePart =
      endsAt && endsAt.length >= 10
        ? endsAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    setValue("endsAt", `${datePart}T${time}`, { shouldValidate: true })
  }

  const handleTitleBlur = () => {
    const currentSlug = getValues("slug")
    const currentTitle = getValues("title")
    if (!currentSlug && currentTitle && !saleId) {
      setValue("slug", generateSlug(currentTitle), { shouldValidate: true })
    }
  }

  const handleSelectProduct = (product: SelectableProduct) => {
    const currentFields = getValues("items") || []
    const isAlreadySelected = currentFields.some(
      (f) => f.productId === product.id
    )
    if (!isAlreadySelected) {
      append({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        discountType: "percentage",
        discountValue: 20,
        quantityLimit: null,
      })
    }
    setProductSearchOpen(false)
  }

  const onSubmit = async (values: FlashSaleFormInput) => {
    setServerError(null)
    const result = saleId
      ? await updateFlashSale(saleId, values)
      : await createFlashSale(values)

    if (!result.success) {
      setServerError(result.error || "Failed to save flash sale")
      return
    }

    router.push(onSuccessRedirect)
    router.refresh()
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, (validationErrors) => {
        console.error("Form Validation Errors:", validationErrors)
      })}
      className="space-y-6"
    >
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
          {serverError}
        </div>
      )}

      {/* Grid Layout: نظام العمودين */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* العمود الرئيسي (lg:col-span-2): يحتوي على General Info فوق Participating Products */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* 1. بطاقة المعلومات العامة */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-6">
            <h3 className="border-b border-border/40 pb-2 text-sm font-semibold text-foreground">
              General Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">
                  Title (EN) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Weekend Flash Deals"
                  {...register("title")}
                  onBlur={handleTitleBlur}
                  className="text-xs"
                />
                {errors.title && (
                  <p className="text-[11px] text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="titleAr" className="text-xs">
                  Title (AR)
                </Label>
                <Input
                  id="titleAr"
                  placeholder="مثال: عروض نهاية الأسبوع"
                  dir="rtl"
                  {...register("titleAr")}
                  className="text-xs"
                />
                {errors.titleAr && (
                  <p className="text-[11px] text-destructive">
                    {errors.titleAr.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="slug" className="text-xs">
                  URL Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="weekend-flash-deals"
                  {...register("slug")}
                  className="font-mono text-xs"
                />
                {errors.slug && (
                  <p className="text-[11px] text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs">
                Description
              </Label>
              <Textarea
                id="description"
                rows={2}
                placeholder="Short details regarding the campaign terms or perks..."
                {...register("description")}
                className="resize-none text-xs"
              />
            </div>
          </div>

          {/* 2. بطاقة المنتجات المشاركة */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-6">
            <div className="flex flex-col gap-2 border-b border-border/40 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Participating Products ({fields.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Configure tailored discounts and quantity limits for each
                  product.
                </p>
              </div>

              <Popover
                open={productSearchOpen}
                onOpenChange={setProductSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5 self-start text-xs sm:self-auto"
                  >
                    <PlusIcon className="size-3.5" />
                    Add Products
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <Command>
                    <CommandInput
                      placeholder="Search store products..."
                      className="text-xs"
                    />
                    <CommandList>
                      <CommandEmpty className="p-3 text-center text-xs text-muted-foreground">
                        No products found.
                      </CommandEmpty>
                      <CommandGroup>
                        {availableProducts.map((product) => {
                          const isSelected = fields.some(
                            (f) => f.productId === product.id
                          )
                          return (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              disabled={isSelected}
                              onSelect={() => handleSelectProduct(product)}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="truncate">{product.name}</span>
                              <span className="ml-2 font-mono text-muted-foreground">
                                ${product.price}
                              </span>
                              {isSelected && (
                                <CheckIcon className="ml-1 size-3.5 text-primary" />
                              )}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {errors.items && (
              <p className="text-xs font-medium text-destructive">
                {errors.items.message}
              </p>
            )}

            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                <FlameIcon className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-xs font-medium text-foreground">
                  No products added yet
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Click &quot;Add Products&quot; above to select items for this
                  flash sale.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 font-medium text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5">Product</th>
                      <th className="w-32 px-3 py-2.5">Discount Type</th>
                      <th className="w-24 px-3 py-2.5">Value</th>
                      <th className="w-24 px-3 py-2.5">Deal Price</th>
                      <th className="w-24 px-3 py-2.5">Limit</th>
                      <th className="w-10 px-3 py-2.5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fields.map((field, index) => {
                      const currentItem = watchedItems?.[index]
                      const discountType: FlashSaleDiscountType =
                        currentItem?.discountType || "percentage"
                      const discountVal = currentItem?.discountValue
                      const previewPrice = getPreviewPrice(
                        field.productPrice,
                        discountType,
                        discountVal
                      )

                      return (
                        <tr key={field.id} className="hover:bg-muted/15">
                          <td className="px-3 py-2">
                            <div className="font-semibold text-foreground">
                              {field.productName}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              Base: ${field.productPrice}
                            </div>
                          </td>

                          <td className="px-3 py-2">
                            <Select
                              value={discountType}
                              onValueChange={(val: FlashSaleDiscountType) =>
                                setValue(`items.${index}.discountType`, val, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger className="h-7 text-[11px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">
                                  Percentage (%)
                                </SelectItem>
                                <SelectItem value="fixed_amount">
                                  Fixed Off ($)
                                </SelectItem>
                                <SelectItem value="fixed_price">
                                  Set Price ($)
                                </SelectItem>
                                <SelectItem value="none">
                                  No Discount
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="px-3 py-2">
                            {discountType !== "none" ? (
                              <Input
                                type="number"
                                step="any"
                                min="0"
                                max={
                                  discountType === "percentage"
                                    ? 100
                                    : undefined
                                }
                                placeholder="0"
                                className="h-7 font-mono text-[11px]"
                                {...register(`items.${index}.discountValue`, {
                                  setValueAs: (v) =>
                                    v === "" || v === null || v === undefined
                                      ? 0
                                      : Number(v),
                                })}
                              />
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                -
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-2 font-mono font-bold text-destructive">
                            ${previewPrice.toFixed(2)}
                          </td>

                          {/* حقل Limit: يمكن تركه فارغاً بالكامل ليتم حفظه كـ null دون تركيز إجباري */}
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              placeholder="All"
                              className="h-7 font-mono text-[11px]"
                              {...register(`items.${index}.quantityLimit`, {
                                setValueAs: (v) => {
                                  if (v === "" || v === null || v === undefined)
                                    return null
                                  const num = Number(v)
                                  return isNaN(num) || num <= 0
                                    ? null
                                    : Math.floor(num)
                                },
                              })}
                            />
                          </td>

                          <td className="px-3 py-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="size-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2Icon className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* العمود الجانبي (lg:col-span-1): مخصص لضبط الحالة والمدة الزمنية */}
        <div className="min-w-0 space-y-6 lg:col-span-1">
          {/* بطاقة التفعيل */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="isActive"
                  className="cursor-pointer text-xs font-semibold text-foreground"
                >
                  Campaign Status
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Activate or deactivate this campaign
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          </div>

          {/* بطاقة التوقيت والجدولة */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
            <h3 className="border-b border-border/40 pb-2 text-sm font-semibold text-foreground">
              Schedule & Duration
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="date-picker-range" className="text-xs">
                  Date Range <span className="text-destructive">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker-range"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full justify-start px-2.5 text-xs font-normal",
                        !dateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-3.5" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleRangeSelect}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field className="w-full">
                  <FieldLabel htmlFor="start-time-picker" className="text-xs">
                    Start Time
                  </FieldLabel>
                  <Input
                    type="time"
                    id="start-time-picker"
                    step="1"
                    value={startTime}
                    disabled={isSubmitting}
                    onChange={handleStartTimeChange}
                    className="appearance-none bg-background font-mono text-xs [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </Field>

                <Field className="w-full">
                  <FieldLabel htmlFor="end-time-picker" className="text-xs">
                    End Time
                  </FieldLabel>
                  <Input
                    type="time"
                    id="end-time-picker"
                    step="1"
                    value={endTime}
                    disabled={isSubmitting}
                    onChange={handleEndTimeChange}
                    className="appearance-none bg-background font-mono text-xs [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </Field>
              </div>

              {(errors.startsAt || errors.endsAt) && (
                <p className="text-[11px] text-destructive">
                  {errors.startsAt?.message || errors.endsAt?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* شريط الإجراءات السفلي */}
      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t pt-6 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Discard Changes
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer shadow-xs sm:w-auto sm:min-w-32"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 size-4" />
              {saleId ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>
              <CheckCircle2Icon className="mr-1.5 size-4" />
              {saleId ? "Save Changes" : "Create Flash Sale"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
