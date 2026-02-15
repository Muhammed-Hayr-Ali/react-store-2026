"use client";

import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- استيرادات الواجهة والأيقونات ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, PlusCircle, Image, Tag, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// --- استيرادات الأنواع ---
import { ProductFormData, ProductOption, ProductOptionValue, ProductVariantOptionValue } from "@/lib/types/product";
import { createProduct } from "@/lib/actions/producta-add";

// =================================================================
// واجهة المكون (Props)
// =================================================================
interface AddProductFormProps {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  options: ProductOption[];
  optionValues: ProductOptionValue[];
}

// =================================================================
// المكون الرئيسي للنموذج
// =================================================================
export function AddProductForm({
  categories,
  brands,
  options,
  optionValues,
}: AddProductFormProps) {
  const router = useRouter();
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // --- إعداد react-hook-form ---
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
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
          option_values: [],
        },
      ],
    },
    mode: "onBlur",
  });

  // --- إدارة مصفوفة المتغيرات الديناميكية ---
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // --- تحديث الـ slug تلقائيًا ---
  const productName = watch("name");
  useEffect(() => {
    if (productName) {
      const slug = productName
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [productName, setValue]);

  // --- إضافة وإزالة الوسوم ---
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      const newTag = tagsInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setValue("tags", [...tags, newTag]);
      }
      setTagsInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  // --- دالة الإرسال ---
  const onSubmit: SubmitHandler<ProductFormData> = async (formData) => {
    try {
      // التحقق من وجود صورة رئيسية
      if (!formData.main_image_url && (formData.image_urls?.length ?? 0) > 0) {
        formData.main_image_url = formData.image_urls![0];
      }

      // التحقق من المتغير الافتراضي
      const hasDefaultVariant = formData.variants.some(
        (v) => v.is_default === true,
      );
      if (!hasDefaultVariant && formData.variants.length > 0) {
        formData.variants[0].is_default = true;
      }

      // إنشاء المنتج
      const result = await createProduct(formData);

      if (result.success) {
        toast.success("Product created successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* --- القسم 1: المعلومات الأساسية --- */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Product name is required.",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters.",
                  },
                })}
                disabled={isSubmitting}
                placeholder="e.g., Urban Classic T-Shirt"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...register("slug", {
                  required: "Slug is required.",
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message:
                      "Slug must be lowercase with letters, numbers, and hyphens only.",
                  },
                })}
                disabled={isSubmitting}
                placeholder="e.g., urban-classic-t-shirt"
              />
              {errors.slug && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              {...register("short_description")}
              disabled={isSubmitting}
              placeholder="Brief description for product listings..."
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required.",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters.",
                },
              })}
              disabled={isSubmitting}
              placeholder="Detailed product description..."
              rows={6}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- القسم 2: الوسائط --- */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Image className="mr-2 h-5 w-5 inline" />
            Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="main_image_url">Main Image URL</Label>
            <Input
              id="main_image_url"
              {...register("main_image_url")}
              disabled={isSubmitting}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-1">
            <Label>Additional Images URLs</Label>
            <Controller
              name="image_urls"
              control={control}
              render={({ field }) => (
                <Textarea
                  value={field.value?.join("\n") || ""}
                  onChange={(e) => {
                    const urls = e.target.value
                      .split("\n")
                      .map((url) => url.trim())
                      .filter(Boolean);
                    field.onChange(urls);
                  }}
                  disabled={isSubmitting}
                  placeholder="Enter one URL per line..."
                  rows={4}
                />
              )}
            />
            <p className="text-sm text-muted-foreground">
              Add multiple images, one per line
            </p>
          </div>
        </CardContent>
      </Card>

      {/* --- القسم 3: التصنيف والعلامات --- */}
      <Card>
        <CardHeader>
          <CardTitle>Categorization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Category</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value || null)}
                    defaultValue={field.value || ""}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label>Brand</Label>
              <Controller
                name="brand_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value || null)}
                    defaultValue={field.value || ""}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleAddTag}
                disabled={isSubmitting}
                placeholder="Press Enter to add tag..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  if (tagsInput.trim()) {
                    const newTag = tagsInput.trim();
                    if (!tags.includes(newTag)) {
                      setTags([...tags, newTag]);
                      setValue("tags", [...tags, newTag]);
                    }
                    setTagsInput("");
                  }
                }}
                disabled={isSubmitting}
              >
                <Tag className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- القسم 4: الإعدادات --- */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_available">Available for Sale</Label>
              <p className="text-sm text-muted-foreground">
                Make this product available in the store
              </p>
            </div>
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

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_featured">Featured Product</Label>
              <p className="text-sm text-muted-foreground">
                Display this product in featured sections
              </p>
            </div>
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
        </CardContent>
      </Card>

      {/* --- القسم 5: المتغيرات والخيارات --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variants & Pricing</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                sku: "",
                price: 0,
                stock_quantity: 0,
                is_default: false,
                option_values: [],
              })
            }
            disabled={isSubmitting}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-lg relative bg-muted/50"
            >
              <div className="absolute top-2 left-2">
                <Controller
                  name={`variants.${index}.is_default`}
                  control={control}
                  render={({ field: defaultField }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`default-${index}`}
                        checked={defaultField.value}
                        onCheckedChange={(checked) => {
                          // Ensure only one default variant
                          fields.forEach((_, i) => {
                            setValue(`variants.${i}.is_default`, false);
                          });
                          defaultField.onChange(checked);
                        }}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={`default-${index}`} className="text-sm">
                        Default Variant
                      </Label>
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="space-y-1">
                  <Label>SKU *</Label>
                  <Input
                    {...register(`variants.${index}.sku`, {
                      required: "SKU is required.",
                    })}
                    placeholder="e.g., TSHIRT-RED-L"
                    disabled={isSubmitting}
                  />
                  {errors.variants?.[index]?.sku && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.variants?.[index]?.sku?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Stock Quantity *</Label>
                  <Input
                    type="number"
                    {...register(`variants.${index}.stock_quantity`, {
                      valueAsNumber: true,
                      required: "Stock is required.",
                      min: {
                        value: 0,
                        message: "Stock must be a positive integer.",
                      },
                      validate: (value) =>
                        Number.isInteger(value) ||
                        "Stock must be a whole number.",
                    })}
                    disabled={isSubmitting}
                  />
                  {errors.variants?.[index]?.stock_quantity && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.variants?.[index]?.stock_quantity?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`variants.${index}.price`, {
                      valueAsNumber: true,
                      required: "Price is required.",
                      min: { value: 0, message: "Price must be positive." },
                    })}
                    disabled={isSubmitting}
                  />
                  {errors.variants?.[index]?.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.variants?.[index]?.price?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Discount Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`variants.${index}.discount_price`, {
                      valueAsNumber: true,
                      min: { value: 0, message: "Discount must be positive." },
                    })}
                    disabled={isSubmitting}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Discount Expires At</Label>
                  <Input
                    type="datetime-local"
                    {...register(`variants.${index}.discount_expires_at`)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Variant Image URL</Label>
                  <Input
                    {...register(`variants.${index}.image_url`)}
                    placeholder="https://example.com/variant.jpg"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Options Selection */}
              <div className="mt-4 pt-4 border-t">
                <Label className="mb-2 block">Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((option) => {
                    const availableValues = optionValues.filter(
                      (v) => v.option_id === option.id,
                    );

                    return (
                      <div key={option.id} className="space-y-1">
                        <Label>{option.name}</Label>
                        <Controller
                          name={`variants.${index}.option_values`}
                          control={control}
                          render={({ field }) => {
                            const currentValue = (
                              field.value as ProductVariantOptionValue[]
                            )?.find((v) => v.option_id === option.id)?.value;

                            return (
                              <Select
                                value={currentValue}
                                onValueChange={(value) => {
                                  const updatedValues = (
                                    (field.value as ProductVariantOptionValue[]) ??
                                    []
                                  ).filter((v) => v.option_id !== option.id);
                                  updatedValues.push({
                                    option_id: option.id,
                                    value,
                                  });
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
                                  {availableValues.map((val) => (
                                    <SelectItem key={val.id} value={val.value}>
                                      {val.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                  onClick={() => remove(index)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* --- زر الإرسال النهائي --- */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
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
  );
}
