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
import {
  CustomSheet,
  CustomSheetClose,
  CustomSheetContent,
  CustomSheetDescription,
  CustomSheetFooter,
  CustomSheetHeader,
  CustomSheetTitle,
} from "@/components/ui/custom-sheet"
import { Brand, updateBrand, updateBrandSchema } from "@/lib/actions/brands"

type FormValues = z.infer<typeof updateBrandSchema>

interface UpdateBrandSheetProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  item: Brand | null
  onSuccess: (updatedBrand: Brand) => void
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

export default function UpdateBrandSheet({
  isOpen,
  onOpenChange,
  item,
  onSuccess,
}: UpdateBrandSheetProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const side = getSide({ isMobile, locale })
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // مزامنة قيم النموذج مباشرة مع item عبر خاصية values الآمنة في React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(updateBrandSchema),
    mode: "onChange",
    values: {
      name: item?.name || "",
      name_ar: item?.name_ar || "",
      slug: item?.slug || "",
      logo_url: item?.logo_url || "",
      logo_alt: item?.logo_alt || "",
    },
  })

  const {
    formState: { isSubmitting },
    control,
    setValue,
  } = form

  const logoUrl = useWatch({ control, name: "logo_url" }) || ""
  const nameValue = useWatch({ control, name: "name" }) || ""
  const isValidImage =
    logoUrl.startsWith("http://") || logoUrl.startsWith("https://")

  // معالج إغلاق وفتح موحد دون استدعاء setState داخل الـ Effect
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(null)
    }
    onOpenChange(open)
  }

  const handleGenerateAltText = () => {
    if (!nameValue.trim()) {
      setErrorMessage("Please enter the brand name in English first")
      return
    }
    setErrorMessage(null)
    const generatedAlt = `${nameValue.trim()} official logo`
    setValue("logo_alt", generatedAlt, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  async function onSubmit(data: FormValues) {
    if (!item) {
      setErrorMessage("No brand selected for update.")
      return
    }

    setErrorMessage(null)

    const payload = {
      name: data.name,
      name_ar: data.name_ar || null,
      slug: data.slug,
      logo_url: data.logo_url || null,
      logo_alt: data.logo_alt || null,
    }

    const result = await updateBrand(item.id, payload)

    if (result.success) {
      if (result.data) onSuccess(result.data)
      toast.success("Brand updated successfully!")
      handleOpenChange(false)
      router.refresh()
    } else {
      setErrorMessage(
        result.error || "Failed to update brand. Please try again."
      )
    }
  }

  return (
    <CustomSheet open={isOpen === "update"} onOpenChange={handleOpenChange}>
      <CustomSheetContent
        showCloseButton={false}
        side={side}
        className="flex h-full max-h-screen w-full flex-col p-0 sm:max-w-xl"
      >
        {/* Header - ثابت */}
        <CustomSheetHeader className="shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CustomSheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Edit Brand
              </CustomSheetTitle>
              <CustomSheetDescription className="text-xs text-muted-foreground">
                Modify brand information and logo details.
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
            id="update-brand-form"
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
                        <FieldLabel
                          htmlFor="edit-brand-name"
                          className="text-xs"
                        >
                          Brand Name (EN){" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="edit-brand-name"
                          placeholder="e.g., Apple, Nike"
                          className="h-8 text-xs"
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
                          htmlFor="edit-brand-name-ar"
                          className="text-xs"
                        >
                          Brand Name (AR)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="edit-brand-name-ar"
                          value={field.value ?? ""}
                          placeholder="e.g., أبل، نايكي"
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
                      <FieldLabel htmlFor="edit-brand-slug" className="text-xs">
                        URL Slug <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-brand-slug"
                        placeholder="apple"
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

            {/* Card 2: Brand Logo & Media */}
            <div className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
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
                      <FieldLabel htmlFor="edit-brand-logo" className="text-xs">
                        Logo URL
                      </FieldLabel>

                      {isValidImage && (
                        <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg border bg-muted/20 p-4">
                          <img
                            src={logoUrl}
                            alt="Brand Logo Preview"
                            className="size-full object-contain object-center"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                      )}

                      <Input
                        {...field}
                        id="edit-brand-logo"
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
                      <FieldLabel
                        htmlFor="edit-brand-logo-alt"
                        className="text-xs"
                      >
                        Logo Alt Text
                      </FieldLabel>
                      <div className="relative flex items-center">
                        <Input
                          {...field}
                          id="edit-brand-logo-alt"
                          value={field.value ?? ""}
                          placeholder="e.g., Apple official vector logo"
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
              form="update-brand-form"
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
