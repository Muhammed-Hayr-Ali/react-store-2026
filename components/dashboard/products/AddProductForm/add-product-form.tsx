"use client";

import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Controller,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import slugify from "slugify";

// --- استيرادات الواجهة والأيقونات ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Trash2,
  Tag,
  CheckCircle,
  Plus,
  ImageIcon,
  Info,
  Folder,
  Settings2,
  BadgePercent,
  PlusCircle,
  ListCheck,
  SquarePen,
  Trash,
  Pencil,
  Minus,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// --- استيرادات الأنواع ---
import { ProductFormData } from "@/lib/types/product";
import { createProduct, updateProduct } from "@/lib/actions/products-manager";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Category } from "@/lib/actions/category";
import { Brand } from "@/lib/actions/brands";
import { ProductOption } from "@/lib/actions/product-options";
import { ProductOptionValue } from "@/lib/actions/product-option-values";
import { nanoid } from "nanoid";
import { buildCategoryTree } from "@/lib/utils";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Separator } from "@/components/ui/separator";

import BrandDialog from "./brand-dialog";
import DeleteBrandAlertDialog from "./brand-delete";
import CategoryDialog from "./category-dialog";
import DeleteCategoryAlertDialog from "./category-delete";
import ProductOptionsDialog from "./product-options-dialog";
import DeleteProductOptionAlertDialog from "./product-options-delete";
import VariantDialog from "./variants-dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import DeleteProductOptionValueAlertDialog from "./variants-delete";
import CalculatorDialog from "./calculator-dialog";

// =================================================================
// واجهة المكون (Props)
// =================================================================
interface AddProductFormProps {
  product?: ProductFormData; // بيانات المنتج للتحرير
  categories: Category[];
  brands: Brand[];
  options: ProductOption[];
  optionValues: ProductOptionValue[];
}

interface DialogState {
  isOpen: boolean;
  type:
    | "BrandDialog"
    | "DeleteBrandDialog"
    | "CategoryDialog"
    | "DeleteCategoryDialog"
    | "ProductOptionsDialog"
    | "DeleteProductOptionsDialog"
    | "VariantDialog"
    | "DeleteVariantDialog"
    | "calculator"
    | null;
  data?: {
    brandId?: string; // لـ BrandDialog و DeleteBrandDialog
    categoryId?: string; // لـ CategoryDialog و DeleteCategoryDialog
    productOption?: ProductOption; // لـ ProductOptionsDialog و DeleteProductOptionsDialog
    optionId?: string; // لـ VariantDialog
    valueId?: string; // لـ DeleteVariantDialog
  };
}

// =================================================================
// Generate SKU
// ================================================================
function generateSKU(productName: string) {
  const namePart = productName.slice(0, 3).toUpperCase(); // يأخذ أول 3 أحرف من اسم المنتج
  const uniqueId = nanoid(6).toUpperCase(); // يولد 6 أحرف عشوائية
  return `${namePart}-${uniqueId}`;
}

// =================================================================
// المكون الرئيسي للنموذج
// =================================================================
export function AddProductForm({
  product,
  categories,
  brands,
  options,
  optionValues,
}: AddProductFormProps) {
  const router = useRouter();

  const [tagsInput, setTagsInput] = useState("");
  const [activeDialog, setActiveDialog] = useState<DialogState>({
    type: null,
    isOpen: false,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: product || {
      name: "",
      slug: "",
      description: "",
      short_description: "",
      main_image_url: "",
      image_urls: [],
      category_id: null,
      brand_id: null,
      tags: [],
      is_available: true,
      is_featured: false,
      variants: [
        {
          sku: "",
          price: 0,
          stock_quantity: 0,
          is_default: true,
          variant_options: [],
        },
      ],
    },
    mode: "onBlur",
  });

  const productName = useWatch({ control, name: "name" });
  const currentTags = useWatch({ control, name: "tags" }) ?? [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    if (productName) {
      const slug = slugify(productName, {
        lower: true,
        strict: true,
        locale: "ar",
      });
      const sku = generateSKU(slug);

      setValue("variants.0.sku", sku, { shouldValidate: true });
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [productName, setValue]);

  // --- إدارة الوسوم ---
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      const newTag = tagsInput.trim();
      if (!currentTags.includes(newTag)) {
        setValue("tags", [...currentTags, newTag]);
      }
      setTagsInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter((tag: string) => tag !== tagToRemove);
    setValue("tags", newTags);
  };

  // --- دالة التعامل مع المتغير الافتراضي ---
  const handleDefaultVariantChange = (index: number, checked: boolean) => {
    if (checked) {
      fields.forEach((_, i) => {
        setValue(`variants.${i}.is_default`, i === index, {
          shouldValidate: true,
        });
      });
    }
  };

  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories],
  );

  // --- دالة الإرسال ---
  const onSubmit: SubmitHandler<ProductFormData> = async (formData) => {
    try {
      if (
        !formData.main_image_url &&
        formData.image_urls &&
        formData.image_urls.length > 0
      ) {
        formData.main_image_url = formData.image_urls[0];
      }

      const hasDefaultVariant = formData.variants.some(
        (v) => v.is_default === true,
      );

      if (!hasDefaultVariant && formData.variants.length > 0) {
        formData.variants[0].is_default = true;
      }

      const cleanedData = {
        ...formData,
        variants: formData.variants.map((v) => ({
          ...v,
          variant_options: v.variant_options.filter(
            (opt) => opt.option_value?.id,
          ),
        })),
      };

      let result;
      if (product?.id) {
        // وضع التحرير
        result = await updateProduct(product.id, formData);
        if (result.success) {
          toast.success("Product updated successfully!");
        } else {
          toast.error(result.error ?? "Failed to update product.");
        }
      } else {
        // وضع الإنشاء
        result = await createProduct(formData);
        if (result.success) {
          toast.success("Product created successfully!");
        } else {
          toast.error(result.error ?? "Failed to create product.");
        }
      }

      router.refresh();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product.");
    }
  };

  // Dialog State
  const onCloseDialog = () => {
    setActiveDialog({ type: null, isOpen: false });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information */}
        <Card className="rounded-none shadow-none">
          <CardHeader>
            <CardTitle className="flex gap-2 w-fit items-center">
              <Info className="h-5 w-5" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Name & Slug */}
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="name">Product Name *</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    {...register("name", {
                      required: "product name is required.",
                      minLength: {
                        value: 3,
                        message: "product name must be at least 3 characters.",
                      },
                    })}
                    disabled={isSubmitting}
                    placeholder="e.g., Smartphone V10"
                  />
                  <FieldError>{errors.name?.message}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="slug">Product Slug *</FieldLabel>
                  <Input
                    id="slug"
                    {...register("slug", {
                      required: "product slug is required.",
                      pattern: {
                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                        message:
                          "product slug must contain only lowercase letters, numbers, and hyphens.",
                      },
                    })}
                    disabled={isSubmitting}
                    placeholder="e.g., smartphone-v10"
                  />
                  <FieldError>{errors.slug?.message}</FieldError>
                </Field>
              </div>

              {/* Short Description */}
              <Field>
                <FieldLabel htmlFor="short_description">
                  Short Description
                </FieldLabel>
                <Textarea
                  id="short_description"
                  {...register("short_description", {
                    required: "short description is required.",
                  })}
                  disabled={isSubmitting}
                  placeholder="a brief description that appears in product lists..."
                  rows={3}
                />
                <FieldError>{errors.short_description?.message}</FieldError>
              </Field>

              {/* Description */}
              <Field>
                <FieldLabel htmlFor="description">Full Description</FieldLabel>
                <RichTextEditor
                  content={""}
                  onChange={(val) => setValue("description", val)}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Media */}
        <Card className="rounded-none shadow-none">
          <CardHeader>
            <CardTitle className="flex gap-2 w-fit items-center">
              <ImageIcon className="h-5 w-5" />
              Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="main_image_url">Main Image URL</FieldLabel>
                <Input
                  id="main_image_url"
                  {...register("main_image_url")}
                  disabled={isSubmitting}
                  placeholder="https://example.com/image.jpg"
                  className="font-mono text-sm"
                />
                <FieldError>{errors.main_image_url?.message}</FieldError>
              </Field>

              <Field>
                <div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const currentUrls = getValues("image_urls") ?? [];
                      setValue("image_urls", [...currentUrls, ""], {
                        shouldValidate: true,
                      });
                    }}
                    disabled={isSubmitting}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add More Images
                  </Button>
                </div>

                <div className="space-y-2 mt-2">
                  {getValues("image_urls")?.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No additional images added yet. Click &quot;Add
                      Image&quot; to start.
                    </p>
                  ) : (
                    getValues("image_urls")?.map((_, index) => (
                      <div key={index} className="flex space-y-2 items-start">
                        <div className="flex-1">
                          <Input
                            id={`image_urls.${index}`}
                            value={getValues("image_urls")?.[index] ?? ""}
                            onChange={(e) => {
                              const currentUrls = getValues("image_urls") ?? [];

                              const newUrls = [...currentUrls];
                              newUrls[index] = e.target.value;
                              setValue("image_urls", newUrls, {
                                shouldValidate: true,
                              });
                            }}
                            disabled={isSubmitting}
                            placeholder={`https://example.com/image${index + 1}.jpg`}
                            className="font-mono text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const currentUrls = getValues("image_urls") ?? [];
                            const newUrls = currentUrls.filter(
                              (_, i) => i !== index,
                            );
                            setValue("image_urls", newUrls, {
                              shouldValidate: true,
                            });
                          }}
                          disabled={isSubmitting}
                          className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete Image</span>
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <FieldError>{errors.image_urls?.message}</FieldError>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Categories & Brands & Tags */}
        <Card className="rounded-none shadow-none">
          <CardHeader>
            <CardTitle className="flex gap-2 w-fit items-center">
              <Folder className="h-5 w-5" />
              Categories & Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Tree */}
                <Controller
                  name="category_id"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <Field>
                      <FieldLabel className="flex items-center justify-between">
                        <span>Category</span>
                        {field.value ? (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="icon-xs"
                              variant={"ghost"}
                              className="shrink-0"
                              onClick={() => {
                                // setActiveDialog("CategoryDialog");
                                setActiveDialog({
                                  isOpen: true,
                                  type: "CategoryDialog",
                                  data: { categoryId: field.value as string },
                                }); // للتعديل
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                              <span className="sr-only">Edit Category</span>
                            </Button>

                            <Button
                              type="button"
                              size="icon-xs"
                              variant={"ghost"}
                              className="shrink-0"
                              onClick={() => {
                                // setActiveDialog("DeleteCategoryDialog");
                                setActiveDialog({
                                  isOpen: true,
                                  type: "DeleteCategoryDialog",
                                  data: { categoryId: field.value as string },
                                });
                              }}
                            >
                              <Trash className="h-3 w-3" />
                              <span className="sr-only">Delete Category</span>
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="icon-xs"
                            variant={"ghost"}
                            className="shrink-0"
                            onClick={() => {
                              // setActiveDialog("CategoryDialog");
                              setActiveDialog({
                                isOpen: true,
                                type: "CategoryDialog",
                              });
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Add Category</span>
                          </Button>
                        )}
                      </FieldLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(val) => {
                          if (val === "__clear__") {
                            field.onChange("");
                            return;
                          }
                          field.onChange(val);
                        }}
                        disabled={isSubmitting}
                        aria-invalid={error ? "true" : "false"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              categoryTree.length > 0
                                ? "Select a Category"
                                : "No categories"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__clear__">No Selected</SelectItem>

                          {categoryTree.map((categoryNode) => (
                            <SelectGroup key={categoryNode.id}>
                              <SelectItem value={categoryNode.id}>
                                {categoryNode.name}
                              </SelectItem>
                              {categoryNode.children.map((child) => (
                                <SelectItem key={child.id} value={child.id}>
                                  <div className="flex items-center gap-2 rtl:flex-row-reverse">
                                    <p>-</p> {child.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError>{error?.message}</FieldError>
                    </Field>
                  )}
                />

                {/* Brand */}
                <Controller
                  name="brand_id"
                  control={control}
                  rules={{ required: "Brand is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <Field>
                      <FieldLabel className="flex items-center justify-between">
                        <span>Brand</span>
                        {field.value ? (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="icon-xs"
                              variant={"ghost"}
                              className="shrink-0"
                              onClick={() => {
                                // setActiveDialog("BrandDialog");
                                setActiveDialog({
                                  isOpen: true,
                                  type: "BrandDialog",
                                  data: { brandId: field.value as string },
                                });
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                              <span className="sr-only">Edit Brand</span>
                            </Button>

                            <Button
                              type="button"
                              size="icon-xs"
                              variant={"ghost"}
                              className="shrink-0"
                              onClick={() => {
                                // setActiveDialog("DeleteBrandDialog");
                                setActiveDialog({
                                  isOpen: true,
                                  type: "DeleteBrandDialog",
                                  data: { brandId: field.value as string },
                                });
                              }}
                            >
                              <Trash className="h-3 w-3" />
                              <span className="sr-only">Delete Brand</span>
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="icon-xs"
                            variant={"ghost"}
                            className="shrink-0"
                            onClick={() => {
                              // setActiveDialog("BrandDialog");
                              setActiveDialog({
                                isOpen: true,
                                type: "BrandDialog",
                              });
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Add Brand</span>
                          </Button>
                        )}
                      </FieldLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(val) => {
                          if (val === "__clear__") {
                            field.onChange("");
                            return;
                          }
                          field.onChange(val);
                        }}
                        disabled={isSubmitting}
                        aria-invalid={error ? "true" : "false"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              brands.length > 0 ? "Select a Brand" : "No brands"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__clear__">No Selected</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError>{error?.message}</FieldError>
                    </Field>
                  )}
                />
              </div>
              {/* الوسوم */}
              <Field>
                <FieldLabel>Tags</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    disabled={isSubmitting}
                    placeholder="Press enter to add a tag"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (tagsInput.trim()) {
                        const newTag = tagsInput.trim();
                        if (!currentTags.includes(newTag)) {
                          setValue("tags", [...currentTags, newTag]);
                        }
                        setTagsInput("");
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Add Tag
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTags.map((tag: string) => (
                    <Button
                      key={tag}
                      type="button"
                      size="sm"
                      variant={"secondary"}
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="px-2.5 py-0 text-xs hover:bg-red-300"
                    >
                      {tag}
                      <span className="sr-only">Remove {tag}</span>
                    </Button>
                  ))}
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* --- القسم 4: الإعدادات --- */}
        <Card className="rounded-none shadow-none">
          <CardHeader>
            <CardTitle className="flex gap-2 w-fit items-center">
              <Settings2 className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <Field className="">
                    <FieldLabel htmlFor="is_available">Available</FieldLabel>
                    <FieldDescription>Available for sale</FieldDescription>
                  </Field>
                  <div>
                    <Controller
                      name="is_available"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="is_available"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <Field className="">
                    <FieldLabel htmlFor="is_available">
                      Featured product
                    </FieldLabel>
                    <FieldDescription>
                      Add this product to your featured product list
                    </FieldDescription>
                  </Field>
                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_featured"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Variables and prices */}
        <Card className="rounded-none shadow-none">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="flex gap-2 w-fit items-center">
              <BadgePercent className="h-5 w-5" />
              Variables and prices
            </CardTitle>

            <div className="space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setActiveDialog({
                    isOpen: true,
                    type: "calculator",
                  })
                }
              >
                <Calculator className="mr-1 rtl:mr-auto rtl:ml-1 h-4 w-4" />
                <span className="sr-only">Calculator</span>
              </Button>

              <Button
                type="button"
                onClick={() =>
                  append({
                    sku: "",
                    price: 0,
                    stock_quantity: 0,
                    is_default: false,
                    variant_options: [],
                  })
                }
                disabled={isSubmitting}
              >
                <PlusCircle className="mr-1 rtl:mr-auto rtl:ml-1 h-4 w-4" />
                Add Variable
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 border-none ">
            <FieldGroup className="gap-16">
              {fields.map((field, index) => (
                <div key={field.id} className="border p-4">
                  {/* is default checkbox & remove button */}
                  <div className=" flex justify-between items-center">
                    <Controller
                      name={`variants.${index}.is_default`}
                      control={control}
                      render={({ field: defaultField }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`default-${index}`}
                            checked={defaultField.value}
                            onCheckedChange={(checked) =>
                              handleDefaultVariantChange(index, !!checked)
                            }
                            disabled={isSubmitting}
                          />
                          <FieldLabel
                            htmlFor={`default-${index}`}
                            className="text-sm"
                          >
                            Default Variant
                          </FieldLabel>
                        </div>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                        aria-label="Remove variant"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove variant</span>
                      </Button>
                    )}
                  </div>
                  {/* is_default */}
                  <Field>
                    <div className="flex items-center justify-center"></div>
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <Field>
                      <FieldLabel>SKU *</FieldLabel>
                      <Input
                        {...register(`variants.${index}.sku`, {
                          required: "SKU Field is required.",
                        })}
                        placeholder="e.g. SPV10-BLK"
                        disabled={isSubmitting}
                      />
                      <FieldError>
                        {errors.variants?.[index]?.sku?.message}
                      </FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Stock Quantity *</FieldLabel>
                      <Input
                        type="number"
                        {...register(`variants.${index}.stock_quantity`, {
                          required: "Quantity is required.",
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: "Quantity must be a positive number.",
                          },
                        })}
                        disabled={isSubmitting}
                      />
                      <FieldError>
                        {errors.variants?.[index]?.stock_quantity?.message}
                      </FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Price *</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`variants.${index}.price`, {
                          valueAsNumber: true,
                          required: "Price is required.",
                          min: {
                            value: 0,
                            message: "Price must be a positive number.",
                          },
                        })}
                        disabled={isSubmitting}
                      />
                      <FieldError>
                        {errors.variants?.[index]?.price?.message}
                      </FieldError>
                    </Field>

                    <Field>
                      <FieldLabel>Discount Price</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`variants.${index}.discount_price`, {
                          valueAsNumber: true,
                          min: {
                            value: 0,
                            message: "Discount Price must be a positive number",
                          },
                        })}
                        disabled={isSubmitting}
                        placeholder="Optional"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Expiration Date</FieldLabel>
                      <Input
                        type="datetime-local"
                        {...register(`variants.${index}.discount_expires_at`)}
                        disabled={isSubmitting}
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Image URL</FieldLabel>
                      <Input
                        {...register(`variants.${index}.image_url`)}
                        placeholder="https://example.com/variant.jpg"
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>

                  {/* options */}

                  <Separator className="my-10" />
                  <CardHeader className=" flex justify-between items-center px-0 pb-6">
                    <CardTitle className="flex gap-2 w-fit items-center">
                      <ListCheck className="h-5 w-5" />
                      Product Options
                    </CardTitle>

                    {/* Add New Option */}
                    <Button
                      type="button"
                      size={"sm"}
                      onClick={() => {
                        // setActiveDialog("ProductOptionsDialog");
                        setActiveDialog({
                          isOpen: true,
                          type: "ProductOptionsDialog",
                        });
                      }}
                      disabled={isSubmitting}
                    >
                      <Plus className="mr-1 rtl:mr-auto rtl:ml-1 h-4 w-4" />
                      New Option
                    </Button>
                  </CardHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {options.map((option: ProductOption) => {
                      const availableValues = optionValues.filter(
                        (v) => v.option_id === option.id,
                      );

                      return (
                        <Field key={option.name}>
                          <div className="flex items-center justify-between">
                            <FieldLabel>
                              <div>
                                {option.name}{" "}
                                {option.unit && (
                                  <span className="text-xs text-muted-foreground font-semibold">
                                    ({option.unit})
                                  </span>
                                )}
                                {option.description && (
                                  <span className="text-xs text-muted-foreground font-normal">
                                    {option.description}
                                  </span>
                                )}
                              </div>
                            </FieldLabel>
                            <div>
                              <Button
                                type="button"
                                size="icon-xs"
                                variant={"ghost"}
                                className="shrink-0"
                                onClick={() => {
                                  setActiveDialog({
                                    isOpen: true,
                                    type: "DeleteVariantDialog",
                                    data: {
                                      valueId: activeDialog.data?.valueId,
                                    },
                                  });
                                }}
                              >
                                <Minus className="h-3 w-3" />
                                <span className="sr-only">
                                  Remove option value
                                </span>
                              </Button>
                              <Button
                                type="button"
                                size="icon-xs"
                                variant={"ghost"}
                                className="shrink-0"
                                onClick={() => {
                                  setActiveDialog({
                                    isOpen: true,
                                    type: "VariantDialog",
                                    data: { optionId: option.id },
                                  });
                                }}
                              >
                                <Plus className="h-3 w-3" />
                                <span className="sr-only">
                                  Add option value
                                </span>
                              </Button>
                              <Button
                                type="button"
                                size="icon-xs"
                                variant={"ghost"}
                                className="shrink-0"
                                onClick={() => {
                                  setActiveDialog({
                                    isOpen: true,
                                    type: "ProductOptionsDialog",
                                    data: { productOption: option },
                                  });
                                }}
                              >
                                <SquarePen className="h-3 w-3" />
                                <span className="sr-only">Edit option</span>
                              </Button>

                              <Button
                                type="button"
                                size="icon-xs"
                                variant={"ghost"}
                                className="shrink-0"
                                onClick={() => {
                                  setActiveDialog({
                                    isOpen: true,
                                    type: "DeleteProductOptionsDialog",
                                    data: { productOption: option },
                                  });
                                }}
                              >
                                <Trash className="h-3 w-3" />
                                <span className="sr-only">Remove option</span>
                              </Button>
                            </div>
                          </div>

                          <Controller
                            name={`variants.${index}.variant_options`}
                            control={control}
                            render={({ field }) => {
                              const currentOptions = field.value ?? [];

                              // Find the currently selected option for this specific product option ID
                              const selectedOption = currentOptions.find(
                                (opt) =>
                                  opt.option_value?.product_options?.id ===
                                  option.id,
                              );

                              const currentValue =
                                selectedOption?.option_value?.id ?? "";

                              return (
                                <Select
                                  // If currentValue is empty, the placeholder will be shown
                                  value={currentValue}
                                  onValueChange={(value) => {
                                    // 1. Always filter out the old selection for this option ID first
                                    const updatedValues = currentOptions.filter(
                                      (opt) =>
                                        opt.option_value?.product_options
                                          ?.id !== option.id,
                                    );

                                    // 2. Check if the user selected the "Clear" option
                                    if (value === "__clear__") {
                                      // Update with only the filtered list (effectively removing this selection)
                                      // This results in an empty value, showing the placeholder
                                      field.onChange(updatedValues);
                                      return;
                                    }
                                    setActiveDialog({
                                      isOpen: false,
                                      type: "DeleteVariantDialog",
                                      data: { valueId: value },
                                    });

                                    // 3. Handle normal value selection
                                    const selectedValue = availableValues.find(
                                      (v) => v.id === value,
                                    );

                                    if (selectedValue) {
                                      updatedValues.push({
                                        option_value: {
                                          id: selectedValue.id,
                                          value: selectedValue.value,
                                          product_options: {
                                            id: option.id,
                                            name: option.name,
                                          },
                                        },
                                      });
                                    }

                                    field.onChange(updatedValues);
                                  }}
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={`Select ${option.name.toLowerCase()}`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {/* Special item to clear selection (uses a non-empty string value) */}
                                      <SelectItem value="__clear__">
                                        No Selected
                                      </SelectItem>

                                      {availableValues.length > 0 ? (
                                        availableValues.map((val) => (
                                          <SelectItem
                                            key={val.value}
                                            value={val.id}
                                            className="gap-0"
                                          >
                                            <div className="flex items-center gap-x-0.5">
                                              <span>{val.value}</span>
                                              {option.unit && (
                                                <span className="text-xs text-muted-foreground">
                                                  ({option.unit})
                                                </span>
                                              )}
                                            </div>
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="no-values" disabled>
                                          No Values Available
                                        </SelectItem>
                                      )}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              );
                            }}
                          />
                        </Field>
                      );
                    })}
                  </div>

                  {options.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No options yet.
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDialog({
                            isOpen: true,
                            type: "ProductOptionsDialog",
                          });
                        }}
                        className="text-primary hover:underline"
                      >
                        Add Option
                      </button>
                    </p>
                  )}
                </div>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>

        {/* --- زر الإرسال النهائي --- */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="destructive" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Dialogs Manager */}

      {/* Brand Dialog */}
      <Dialog
        open={activeDialog.type === "BrandDialog"}
        onOpenChange={onCloseDialog}
      >
        <BrandDialog
          onClose={onCloseDialog}
          brand={
            brands.find((b) => b.id === activeDialog.data?.brandId) ?? null
          }
          className="lg:max-w-lg"
        />
      </Dialog>

      {/* Brand Delete Dialog */}
      <AlertDialog
        open={activeDialog.type === "DeleteBrandDialog"}
        onOpenChange={onCloseDialog}
      >
        <DeleteBrandAlertDialog
          onClose={onCloseDialog}
          brand={
            brands.find((b) => b.id === activeDialog.data?.brandId) ?? null
          }
        />
      </AlertDialog>

      {/* Category Dialog */}
      <Dialog
        open={activeDialog.type === "CategoryDialog"}
        onOpenChange={onCloseDialog}
      >
        <CategoryDialog
          onClose={onCloseDialog}
          category={
            categories.find((c) => c.id === activeDialog.data?.categoryId) ??
            null
          }
          categories={categories}
          className="lg:max-w-lg"
        />
      </Dialog>

      {/* Category Delete Dialog */}
      <AlertDialog
        open={activeDialog.type === "DeleteCategoryDialog"}
        onOpenChange={onCloseDialog}
      >
        <DeleteCategoryAlertDialog
          onClose={onCloseDialog}
          category={
            categories.find((c) => c.id === activeDialog.data?.categoryId) ??
            null
          }
        />
      </AlertDialog>

      {/* ProductOption Dialog */}
      <Dialog
        open={activeDialog.type === "ProductOptionsDialog"}
        onOpenChange={onCloseDialog}
      >
        <ProductOptionsDialog
          onClose={onCloseDialog}
          productOption={activeDialog.data?.productOption ?? null}
          // productOption={selectedProductOption}
          className="lg:max-w-lg"
        />
      </Dialog>

      {/* ProductOption Delete Dialog */}
      <AlertDialog
        open={activeDialog.type === "DeleteProductOptionsDialog"}
        onOpenChange={onCloseDialog}
      >
        <DeleteProductOptionAlertDialog
          onClose={onCloseDialog}
          productOption={activeDialog.data?.productOption ?? null}
        />
      </AlertDialog>

      {/* ProductOption Dialog */}
      <Dialog
        open={activeDialog.type === "VariantDialog"}
        onOpenChange={onCloseDialog}
      >
        <VariantDialog
          onClose={onCloseDialog}
          optionName={
            options.find((o) => o.id === activeDialog.data?.optionId)?.name ??
            ""
          }
          optionId={activeDialog.data?.optionId ?? null}
          className="lg:max-w-lg"
        />
      </Dialog>

      {/* ProductOption Delete Dialog */}
      <AlertDialog
        open={
          activeDialog.type === "DeleteVariantDialog" && activeDialog.isOpen
        }
        onOpenChange={onCloseDialog}
      >
        <DeleteProductOptionValueAlertDialog
          onClose={onCloseDialog}
          valueId={activeDialog.data?.valueId ?? null}
        />
      </AlertDialog>

      <Dialog
        open={activeDialog.type === "calculator"}
        onOpenChange={onCloseDialog}
      >
        <CalculatorDialog onClose={onCloseDialog} />
      </Dialog>
    </>
  );
}
