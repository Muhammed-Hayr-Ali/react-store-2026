"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import slugify from "slugify"
import {
  TagIcon,
  ImageIcon,
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Brand,
  createBrand,
  createBrandSchema,
  updateBrand,
  updateBrandSchema,
} from "@/lib/actions/brands"

type CreateFormValues = z.infer<typeof createBrandSchema>
type UpdateFormValues = z.infer<typeof updateBrandSchema>
type BrandFormValues = CreateFormValues | UpdateFormValues

function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    replacement: "-",
    trim: true,
  })
}

interface BrandFormProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  item?: Brand | null
  onSuccess: (brand: Brand) => void
}

export default function BrandForm({
  isOpen,
  onOpenChange,
  item,
  onSuccess,
}: BrandFormProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const isEditing = Boolean(item)
  const mode = isEditing ? "update" : "create"

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(isEditing ? updateBrandSchema : createBrandSchema),
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
    getFieldState,
    reset,
  } = form

  const logoUrl = useWatch({ control, name: "logo_url" }) || ""
  const nameValue = useWatch({ control, name: "name" }) || ""
  const isValidImage =
    logoUrl.startsWith("http://") || logoUrl.startsWith("https://")

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setErrorMessage(null)
      if (!isEditing) reset()
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

  async function onSubmit(data: BrandFormValues) {
    setErrorMessage(null)

    let result
    if (isEditing && item) {
      const updateData = data as UpdateFormValues
      const payload = {
        name: updateData.name,
        name_ar: updateData.name_ar || null,
        slug: updateData.slug,
        logo_url: updateData.logo_url || null,
        logo_alt: updateData.logo_alt || null,
      }
      result = await updateBrand(item.id, payload)
    } else {
      const createData = data as CreateFormValues
      const payload = {
        name: createData.name,
        name_ar: createData.name_ar === "" ? null : createData.name_ar,
        slug: createData.slug,
        logo_url: createData.logo_url === "" ? null : createData.logo_url,
        logo_alt: createData.logo_alt === "" ? null : createData.logo_alt,
      }
      result = await createBrand(payload)
    }

    if (result.success) {
      if (result.data) onSuccess(result.data)
      toast.success(
        isEditing
          ? "Brand updated successfully!"
          : "Brand created successfully!"
      )
      handleOpenChange(false)
      router.refresh()
    } else {
      const errorMsg =
        result.error === "VALIDATION_ERROR"
          ? "Please check the entered data."
          : result.error === "SLUG_ALREADY_EXISTS"
            ? "Slug is already in use."
            : result.error ||
              (isEditing
                ? "Failed to update brand. Please try again."
                : "Failed to create brand. Please try again.")
      setErrorMessage(errorMsg)
    }
  }

  return (
    <Sheet open={isOpen === mode} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col p-0">
        <SheetHeader className="shrink-0 border-b bg-card px-5 py-4 sm:px-6">
          <SheetTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {isEditing ? "Edit Brand" : "Add Brand"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Modify brand information and logo details."
              : "Create a new brand to associate with your store products."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <form
            id="brand-form-element"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pb-6"
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
                >
                  <XIcon className="size-4" />
                </button>
              </Alert>
            )}

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
                            if (!isEditing && !getFieldState("slug").isDirty) {
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
                        <FieldLabel htmlFor="brand-name-ar" className="text-xs">
                          Brand Name (AR)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="brand-name-ar"
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
                      <FieldLabel htmlFor="brand-slug" className="text-xs">
                        URL Slug <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id="brand-slug"
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
                      <FieldLabel htmlFor="brand-logo" className="text-xs">
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
                      <div className="relative flex items-center">
                        <Input
                          {...field}
                          id="brand-logo-alt"
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

        <SheetFooter className="shrink-0 border-t bg-card px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex w-full flex-col-reverse items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="w-full cursor-pointer text-xs sm:w-auto"
              >
                Discard
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="brand-form-element"
              disabled={isSubmitting}
              className="w-full cursor-pointer text-xs shadow-xs sm:w-auto sm:min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-3.5" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Save Brand"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
