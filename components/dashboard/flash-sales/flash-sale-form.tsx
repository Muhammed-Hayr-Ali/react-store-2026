"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckIcon,
  FlameIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  flashSaleFormSchema,
  FlashSaleFormInput,
} from "@/lib/actions/flash-sales/schema"
import { FlashSaleDiscountType } from "@/lib/actions/flash-sales/types"
import { createFlashSale } from "@/lib/actions/flash-sales/mutations/create"
import { updateFlashSale } from "@/lib/actions/flash-sales/mutations/update"

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
  onSuccessRedirect = "/dashboard/flash-sales",
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FlashSaleFormInput>({
    resolver: zodResolver(flashSaleFormSchema),
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

  const watchedItems = watch("items")
  const watchedTitle = watch("title")

  const handleTitleBlur = () => {
    const currentSlug = watch("slug")
    if (!currentSlug && watchedTitle && !saleId) {
      setValue("slug", generateSlug(watchedTitle), { shouldValidate: true })
    }
  }

  const handleSelectProduct = (product: SelectableProduct) => {
    const isAlreadySelected = fields.some((f) => f.productId === product.id)
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
          {serverError}
        </div>
      )}

      {/* قسم 1: تفاصيل الحملة العامة */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
        <h3 className="border-b border-border/40 pb-2 text-sm font-semibold text-foreground">
          General Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs">
              Campaign Title (EN) <span className="text-destructive">*</span>
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
              Campaign Title (AR)
            </Label>
            <Input
              id="titleAr"
              placeholder="مثال: عروض نهاية الأسبوع السريعة"
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

          <div className="space-y-1.5">
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

          <div className="flex items-center justify-between pt-5 sm:justify-start sm:gap-6">
            <div className="space-y-0.5">
              <Label
                htmlFor="isActive"
                className="cursor-pointer text-xs font-medium"
              >
                Campaign Active Status
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Display campaign when start time is reached
              </p>
            </div>
            <Switch
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
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

        <div className="grid grid-cols-1 gap-4 border-t border-border/30 pt-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="startsAt" className="text-xs">
              Starts At <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startsAt"
              type="datetime-local"
              {...register("startsAt")}
              className="text-xs"
            />
            {errors.startsAt && (
              <p className="text-[11px] text-destructive">
                {errors.startsAt.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endsAt" className="text-xs">
              Ends At <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endsAt"
              type="datetime-local"
              {...register("endsAt")}
              className="text-xs"
            />
            {errors.endsAt && (
              <p className="text-[11px] text-destructive">
                {errors.endsAt.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* قسم 2: اختيار وتخصيص منتجات الحملة */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Participating Products ({fields.length})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Configure tailored discounts and quantity limits for each product.
            </p>
          </div>

          <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
            <FlameIcon className="mb-1 size-8 text-muted-foreground/50" />
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
                            <SelectItem value="none">No Discount</SelectItem>
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
                              discountType === "percentage" ? 100 : undefined
                            }
                            placeholder="0"
                            className="h-7 font-mono text-[11px]"
                            {...register(`items.${index}.discountValue`, {
                              valueAsNumber: true,
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

                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="All"
                          className="h-7 font-mono text-[11px]"
                          {...register(`items.${index}.quantityLimit`, {
                            setValueAs: (v) =>
                              v === "" || isNaN(v) ? null : Number(v),
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

      {/* أزرار الإجراءات */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-destructive-foreground min-w-28 bg-destructive text-xs hover:bg-destructive/90"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
              {saleId ? "Saving..." : "Creating..."}
            </>
          ) : saleId ? (
            "Save Changes"
          ) : (
            "Create Flash Sale"
          )}
        </Button>
      </div>
    </form>
  )
}
