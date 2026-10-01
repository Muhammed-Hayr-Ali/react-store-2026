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
  TagIcon,
  ImageIcon,
  CheckCircle2Icon,
  XIcon,
  Wand2Icon,
} from "lucide-react"

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
  CustomSheet,
  CustomSheetClose,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetFooter,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/ui/custom-sheet"
import { Brand, createBrand, createBrandSchema } from "@/lib/actions/brands"

type FormValues = z.infer<typeof createBrandSchema>

function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    replacement: "-",
    trim: true,
  })
}

interface CreateBrandSheetProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: (newBrand: Brand) => void
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

export default function CreateBrandSheet({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateBrandSheetProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const side = getSide({ isMobile, locale })

  const form = useForm<FormValues>({
    resolver: zodResolver(createBrandSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      name_ar: "",
      slug: "",
      logo_url: "",
      logo_alt: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
    control,
    setValue,
    getFieldState,
  } = form

  const logoUrl = useWatch({ control, name: "logo_url" }) || ""
  const nameValue = useWatch({ control, name: "name" }) || ""
  const isValidImage =
    logoUrl.startsWith("http://") || logoUrl.startsWith("https://")

  React.useEffect(() => {
    if (isOpen === "create") {
      form.reset()
    }
  }, [isOpen, form])

  const handleGenerateSlug = () => {
    if (!nameValue.trim()) {
      toast.error("يرجى إدخال اسم العلامة التجارية بالإنجليزية أولاً")
      return
    }
    setValue("slug", generateSlug(nameValue), {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  async function onSubmit(data: FormValues) {
    const payload = {
      name: data.name,
      name_ar: data.name_ar === "" ? null : data.name_ar,
      slug: data.slug,
      logo_url: data.logo_url === "" ? null : data.logo_url,
      logo_alt: data.logo_alt === "" ? null : data.logo_alt,
    }

    const result = await createBrand(payload)

    if (result.success) {
      if (result.data) onSuccess(result.data)
      toast.success("Brand created successfully!")
      onOpenChange(false)
      form.reset()
      router.refresh()
    } else {
      const errorMsg =
        result.error === "VALIDATION_ERROR"
          ? "يرجى التحقق من صحة البيانات المدخلة."
          : result.error === "SLUG_ALREADY_EXISTS"
            ? "الاسم المستعار (Slug) مستخدم بالفعل."
            : result.error || "Failed to create brand. Please try again."
      toast.error(errorMsg)
    }
  }

  return (
    <CustomSheet open={isOpen === "create"} onOpenChange={onOpenChange}>
      <CustomSheetContent showCloseButton={false} side={side}>
        <CustomSheetHeader className="shrink-0 border-b bg-card/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CustomSheetTitle className="text-lg font-bold tracking-tight text-foreground">
                Add Brand
              </CustomSheetTitle>
              <CustomSheetDescription className="text-xs text-muted-foreground">
                Create a new brand to associate with your store products.
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

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form
            id="create-brand-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* بطاقة 1: Basic Information */}
            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <TagIcon className="size-4 text-primary" />
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
                        <FieldLabel htmlFor="brand-name" className="text-xs">
                          Brand Name (EN){" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="brand-name"
                          placeholder="e.g., Apple, Nike"
                          className="h-8 text-xs"
                          onChange={(e) => {
                            const newName = e.target.value
                            field.onChange(newName)
                            if (!getFieldState("slug").isDirty) {
                              setValue("slug", generateSlug(newName), {
                                shouldValidate: true,
                              })
                            }
                            if (!getFieldState("logo_alt").isDirty) {
                              setValue("logo_alt", `${newName} Logo`, {
                                shouldValidate: false,
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
                        <FieldLabel htmlFor="brand-name-ar" className="text-xs">
                          Brand Name (AR)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="brand-name-ar"
                          value={field.value ?? ""}
                          placeholder="مثال: أبل، نايكي"
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
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="brand-slug" className="text-xs">
                          URL Slug <span className="text-destructive">*</span>
                        </FieldLabel>
                        <button
                          type="button"
                          onClick={handleGenerateSlug}
                          className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <Wand2Icon className="size-3" />
                          <span>Generate</span>
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <Input
                          {...field}
                          id="brand-slug"
                          placeholder="apple"
                          className="h-8 pe-8 font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleGenerateSlug}
                          title="Generate Slug"
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
              </FieldGroup>
            </div>

            {/* بطاقة 2: Brand Logo & Media */}
            <div className="rounded-xl border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center gap-2 border-b pb-3">
                <ImageIcon className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Logo & Visuals
                </h2>
              </div>

              <FieldGroup className="space-y-4">
                <Controller
                  name="logo_url"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="brand-logo" className="text-xs">
                        Logo URL
                      </FieldLabel>

                      {isValidImage && (
                        <div className="relative mb-2 flex size-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/20 p-2">
                          <img
                            src={logoUrl}
                            alt="Brand Logo Preview"
                            className="object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                      )}

                      <Input
                        {...field}
                        id="brand-logo"
                        value={field.value ?? ""}
                        placeholder="https://example.com/brand-logo.png"
                        className="h-8 text-xs"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="logo_alt"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="brand-logo-alt" className="text-xs">
                        Logo Alt Text
                      </FieldLabel>
                      <Input
                        {...field}
                        id="brand-logo-alt"
                        value={field.value ?? ""}
                        placeholder="e.g., Apple official vector logo"
                        className="h-8 text-xs"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {errors.root && (
              <FieldError
                errors={[
                  {
                    message:
                      errors.root.message || "An unexpected error occurred",
                  },
                ]}
              />
            )}
          </form>
        </div>

        <CustomSheetFooter className="shrink-0 border-t bg-card/50 px-6 py-4">
          <div className="flex w-full items-center justify-end gap-2.5">
            <CustomSheetClose asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Discard
              </Button>
            </CustomSheetClose>
            <Button
              type="submit"
              form="create-brand-form"
              size="sm"
              disabled={isSubmitting}
              className="min-w-32 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="mr-1.5 size-4" />
                  Save Brand
                </>
              )}
            </Button>
          </div>
        </CustomSheetFooter>
      </CustomSheetContent>
    </CustomSheet>
  )
}
