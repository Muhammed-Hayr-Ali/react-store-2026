"use client"

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { SparklesIcon, LinkIcon } from "lucide-react"
import { CustomInput } from "@/components/ui/custom-input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Image from "next/image"
import { Category, createCategorySchema } from "@/lib/actions/categories"
import { generateSlug } from "@/lib/actions/utils/slug_generator"
import { CustomButton } from "@/components/ui/custom-button"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { DialogClose, DialogDescription, DialogTitle } from "@radix-ui/react-dialog"

// Data Type
type FormValues = z.infer<typeof createCategorySchema>

interface CreateCategoryProps {
  isOpen: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: (newCategory: Category) => void
  categories: Category[] | null
}

// main component
export default function CreateCategory({
  isOpen,
  onOpenChange,
  onSuccess,
  categories,
}: CreateCategoryProps) {
  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      name_ar: "",
      slug: "",
      description: "",
      parent_id: null,
      is_active: true,
      sort_order: 0,
      image_url: "",
      image_alt: "",
    },
  })

  // Form State
  const {
    formState: { isSubmitting, errors },
  } = form

  // Watch Form Values
  const imageUrl =
    useWatch({
      control: form.control,
      name: "image_url",
      defaultValue: "",
    }) || ""

  // Is Image Valid
  const isValidImage = imageUrl?.startsWith("http") || false

  // On Submit
  async function onSubmit(data: FormValues) {}

  // Form Render

  return (
    <Dialog open={isOpen === "create"} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-category-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  1
                </span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">English Name *</FieldLabel>

                      <CustomInput
                        {...field}
                        id="name"
                        placeholder="e.g., Electronics"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => {
                          const newName = e.target.value
                          field.onChange(newName)
                          if (!form.getFieldState("slug").isDirty) {
                            form.setValue("slug", generateSlug(newName), {
                              shouldValidate: false,
                              shouldDirty: false,
                            })
                          }
                          if (!form.getFieldState("image_alt").isDirty) {
                            form.setValue("image_alt", newName, {
                              shouldValidate: false,
                              shouldDirty: false,
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
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name_ar">Arabic Name</FieldLabel>
                      <CustomInput
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        id="name_ar"
                        placeholder="مثال: إلكترونيات"
                        dir="rtl"
                        aria-invalid={fieldState.invalid}
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
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="slug"
                      className="flex items-center gap-1.5"
                    >
                      Slug *{" "}
                      <SparklesIcon className="size-3.5 text-amber-500" />
                    </FieldLabel>
                    <CustomInput
                      {...field}
                      id="slug"
                      placeholder="electronics"
                      className="font-mono text-sm"
                      aria-invalid={fieldState.invalid}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Auto-generated from English name. URL-friendly.
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Separator />

            {/* Section 2: Media & SEO */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  2
                </span>
                Media & SEO
              </h3>

              <Controller
                name="image_url"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="image_url">Image URL</FieldLabel>
                    {isValidImage && (
                      <div className="mb-2 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        <Image
                          width={400}
                          height={225}
                          src={imageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover object-center"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>
                    )}
                    <CustomInput
                      {...field}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      id="image_url"
                      placeholder="https://example.com/image.jpg"
                      aria-invalid={fieldState.invalid}
                      prefixIcon={
                        <LinkIcon className="size-4 text-muted-foreground" />
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="image_alt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="image_alt"
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        Image Alt Text{" "}
                        <SparklesIcon className="size-3.5 text-amber-500" />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/200
                      </span>
                    </FieldLabel>
                    <CustomInput
                      {...field}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      id="image_alt"
                      placeholder="e.g., Electronics category banner"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="description"
                      className="flex items-center justify-between"
                    >
                      <span>Description</span>
                      <span className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/500
                      </span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      id="description"
                      placeholder="Brief description for SEO and internal use..."
                      className="min-h-25 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Separator />

            {/* Section 3: Display Settings */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  3
                </span>
                Display Settings
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="parent_id"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="parent_id">
                        Parent Category
                      </FieldLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        value={field.value || "none"}
                      >
                        <SelectTrigger
                          id="parent_id"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Main Category)
                          </SelectItem>
                          {categories &&
                            categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                                {category.name_ar && (
                                  <span className="ms-1 text-muted-foreground">
                                    - {category.name_ar}
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
                  name="sort_order"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="sort_order">Sort Order</FieldLabel>
                      <CustomInput
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        id="sort_order"
                        type="number"
                        min="0"
                        aria-invalid={fieldState.invalid}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Lower numbers appear first.
                      </p>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="is_active"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex flex-row items-center justify-between rounded-lg border bg-muted/20 p-4"
                  >
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor="is_active" className="text-base">
                        Active Status
                      </FieldLabel>
                      <p className="text-xs text-muted-foreground">
                        Category will be visible to customers immediately.
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                )}
              />
            </div>

            {errors.root && (
              <FieldError
                errors={[
                  { message: errors.root.message || "An error occurred" },
                ]}
              />
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <CustomButton variant="outline">Cancel</CustomButton>
          </DialogClose>
          <CustomButton  type="submit" form="create-category-form">Save changes</CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
