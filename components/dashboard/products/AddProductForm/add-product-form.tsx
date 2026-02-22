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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Trash2,
  Tag,
  CheckCircle,
  X,
  Plus,
  Store,
  ListPlus,
  ImageIcon,
  Info,
  Folder,
  Settings2,
  BadgePercent,
  PlusCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// --- استيرادات الأنواع ---
import {
  ProductFormData,
  ProductOption,
  ProductOptionValue,
} from "@/lib/types/product";
import { createProduct } from "@/lib/actions/producta-add";
import { createBrand } from "@/lib/actions/brands";
import { createCategory } from "@/lib/actions/category";
// ⚠️ تأكد من وجود هذين الملفين في lib/actions/
import { createProductOption } from "@/lib/actions/product-options";
import { createProductOptionValue } from "@/lib/actions/product-option-values";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import CategoryForm from "./category-form";
import { useLocale } from "next-intl";
import BrandForm from "./brand-form";

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
// Dialog State
// =================================================================
type DialogState = "category" | "brand" | "otherState2" | null;

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};

// =================================================================
// المكون الرئيسي للنموذج
// =================================================================
export function AddProductForm({
  categories,
  brands,
  options,
  optionValues,
}: AddProductFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  const [tagsInput, setTagsInput] = useState("");

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<DialogState>(null);

  // ✅ حالة نوافذ إضافة الخيارات
  const [isNewOptionDialogOpen, setIsNewOptionDialogOpen] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [isCreatingOption, setIsCreatingOption] = useState(false);

  const [isNewOptionValueDialogOpen, setIsNewOptionValueDialogOpen] =
    useState(false);
  const [selectedOptionForValue, setSelectedOptionForValue] =
    useState<string>("");
  const [newOptionValueName, setNewOptionValueName] = useState("");
  const [isCreatingOptionValue, setIsCreatingOptionValue] = useState(false);

  // --- إعداد react-hook-form ---
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
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
          variant_options: [],
        },
      ],
    },
    mode: "onBlur",
  });

  // --- مراقبة القيم الهامة ---
  const productName = watch("name");
  const currentTags = watch("tags") || [];


  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });


  // --- تحديث الـ slug تلقائيًا (مع دعم العربية) ---
  useEffect(() => {
    if (productName) {
      const slug = slugify(productName, {
        lower: true,
        strict: true,
        locale: "ar",
      });
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
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    setValue("tags", newTags);
  };

  // --- ✅ إضافة نوع خيار جديد (مثل: Material, Style) ---
  const handleCreateProductOption = async () => {
    if (!newOptionName.trim()) {
      toast.error("يرجى إدخال اسم الخيار");
      return;
    }

    setIsCreatingOption(true);
    try {
      const result = await createProductOption({
        name: newOptionName.trim(),
      });

      if (result.success && result.optionId) {
        toast.success("تم إضافة الخيار بنجاح");
        setNewOptionName("");
        setIsNewOptionDialogOpen(false);
        router.refresh(); // تحديث قائمة الخيارات
      } else {
        toast.error(result.error || "فشل إضافة الخيار");
      }
    } catch (error) {
      console.error("Error creating product option:", error);
      toast.error("حدث خطأ أثناء إضافة الخيار");
    } finally {
      setIsCreatingOption(false);
    }
  };

  // --- ✅ إضافة قيمة خيار جديدة (مثل: Green for Color) ---
  const handleCreateProductOptionValue = async () => {
    if (!selectedOptionForValue || !newOptionValueName.trim()) {
      toast.error("يرجى اختيار الخيار وإدخال القيمة");
      return;
    }

    setIsCreatingOptionValue(true);
    try {
      const result = await createProductOptionValue({
        option_id: selectedOptionForValue,
        value: newOptionValueName.trim(),
      });

      if (result.success && result.optionValueId) {
        toast.success("تم إضافة القيمة بنجاح");
        setNewOptionValueName("");
        setSelectedOptionForValue("");
        setIsNewOptionValueDialogOpen(false);
        router.refresh(); // تحديث قائمة قيم الخيارات
      } else {
        toast.error(result.error || "فشل إضافة قيمة الخيار");
      }
    } catch (error) {
      console.error("Error creating product option value:", error);
      toast.error("حدث خطأ أثناء إضافة قيمة الخيار");
    } finally {
      setIsCreatingOptionValue(false);
    }
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

      formData.variants = formData.variants.map((variant) => ({
        ...variant,
        variant_options: variant.variant_options?.filter(
          (opt) => opt.option_value?.id,
        ),
      }));

      const result = await createProduct(formData);

      if (result.success && result.productId) {
        toast.success("تم إنشاء المنتج بنجاح!");
        router.refresh();
      } else {
        toast.error(result.error || "فشل إنشاء المنتج");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information */}
        <Card>
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
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  {...register("description", {
                    required: "full description is required.",
                    minLength: {
                      value: 10,
                      message:
                        "full description must be at least 10 characters.",
                    },
                  })}
                  disabled={isSubmitting}
                  placeholder="a detailed description of the product..."
                  rows={6}
                />
                <FieldError>{errors.description?.message}</FieldError>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
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
                  {...register("main_image_url", {
                    required: "main image url is required.",
                    pattern: {
                      value:
                        /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|svg))$/i,
                      message: "main image url must be a valid image URL.",
                    },
                  })}
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
                      const currentUrls = getValues("image_urls") || [];
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
                            value={watch("image_urls")?.[index] || ""}
                            onChange={(e) => {
                              const currentUrls = watch("image_urls") || [];
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
                            const currentUrls = watch("image_urls") || [];
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

        {/* --- القسم 3: التصنيفات والعلامات --- */}
        <Card>
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
                {/* Category */}
                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(val) => setValue("category_id", val)}
                    >
                      <SelectTrigger dir={dir} className="w-full max-w-48">
                        <SelectValue placeholder="Select a Category" />
                      </SelectTrigger>
                      <SelectContent dir={dir}>
                        <SelectGroup>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      size="icon-sm"
                      variant={"outline"}
                      className="shrink-0 size-9"
                      onClick={() => {
                        setIsOpen(true);
                        setActiveDialog("category");
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </Field>
                {/* brand */}
                <Field>
                  <FieldLabel>Brand</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(val) => setValue("brand_id", val)}>
                      <SelectTrigger dir={dir} className="w-full max-w-48">
                        <SelectValue placeholder="Select a Brand" />
                      </SelectTrigger>
                      <SelectContent dir={dir}>
                        <SelectGroup>
                          {brands.map((bnd) => (
                            <SelectItem key={bnd.id} value={bnd.id}>
                              {bnd.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      size="icon-sm"
                      variant={"outline"}
                      className="shrink-0 size-9"
                      onClick={() => {
                        setIsOpen(true);
                        setActiveDialog("brand");
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </Field>
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
                    placeholder="اضغط Enter لإضافة وسم..."
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
                    إضافة
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="p-2 flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rtl:ml-auto rtl:mr-1 hover:text-red-500"
                        aria-label={`إزالة الوسم ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* --- القسم 4: الإعدادات --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 w-fit items-center">
              <Settings2 className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardHeader>
            <CardTitle>الإعدادات</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 w-fit items-center">
              <BadgePercent className="h-5 w-5" />
              Variables and prices
            </CardTitle>

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
                  variant_options: [],
                })
              }
              disabled={isSubmitting}
            >
              <PlusCircle  className="mr-2 h-4 w-4" /> إضافة متغير
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg relative bg-muted/50"
                >
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
                            المتغير الافتراضي
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
                        aria-label="حذف المتغير"
                      >
                        <Trash2 className="h-4 w-4" />
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
                          valueAsNumber: true,
                          required: "Quantity is required.",
                          min: {
                            value: 0,
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

                  {/* ✅ خيارات المتغير مع أزرار الإضافة الديناميكية */}
                  <div className="mt-10 pt-6 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="block">Variants</Label>

                      {/* ✅ زر إضافة نوع خيار جديد */}
                      <Dialog
                        open={isNewOptionDialogOpen}
                        onOpenChange={setIsNewOptionDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={isSubmitting}
                            title="إضافة نوع خيار جديد"
                          >
                            <ListPlus className="mr-1 h-3 w-3" />
                            خيار جديد
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>إضافة نوع خيار جديد</DialogTitle>
                            <DialogDescription></DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="new-option-name">
                                اسم الخيار
                              </Label>
                              <Input
                                id="new-option-name"
                                value={newOptionName}
                                onChange={(e) =>
                                  setNewOptionName(e.target.value)
                                }
                                placeholder="مثال: المادة"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleCreateProductOption();
                                  }
                                }}
                                disabled={isCreatingOption}
                                autoFocus
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">
                                إلغاء
                              </Button>
                            </DialogClose>
                            <Button
                              onClick={handleCreateProductOption}
                              disabled={
                                isCreatingOption || !newOptionName.trim()
                              }
                            >
                              {isCreatingOption ? (
                                <>
                                  <Spinner className="mr-2 h-4 w-4" />
                                  جاري الإضافة...
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-2 h-4 w-4" />
                                  إضافة
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {options.map((option) => {
                        const availableValues = optionValues.filter(
                          (v) => v.option_id === option.id,
                        );

                        return (
                          <div key={option.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label>{option.name}</Label>

                              {/* ✅ زر إضافة قيمة خيار جديدة لهذا الخيار */}
                              <Dialog
                                open={isNewOptionValueDialogOpen}
                                onOpenChange={(open) => {
                                  setIsNewOptionValueDialogOpen(open);
                                  if (open) {
                                    setSelectedOptionForValue(option.id);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={isSubmitting}
                                    title={`إضافة قيمة لـ ${option.name}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedOptionForValue(option.id);
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      اضافة قيمة ل{option.name}
                                    </DialogTitle>
                                    <DialogDescription></DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="new-option-value">
                                        القيمة الجديدة
                                      </Label>
                                      <Input
                                        id="new-option-value"
                                        value={newOptionValueName}
                                        onChange={(e) =>
                                          setNewOptionValueName(e.target.value)
                                        }
                                        placeholder={`مثال: أخضر`}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleCreateProductOptionValue();
                                          }
                                        }}
                                        disabled={isCreatingOptionValue}
                                        autoFocus
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button type="button" variant="outline">
                                        إلغاء
                                      </Button>
                                    </DialogClose>
                                    <Button
                                      onClick={handleCreateProductOptionValue}
                                      disabled={
                                        isCreatingOptionValue ||
                                        !newOptionValueName.trim()
                                      }
                                    >
                                      {isCreatingOptionValue ? (
                                        <>
                                          <Spinner className="mr-2 h-4 w-4" />
                                          جاري الإضافة...
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="mr-2 h-4 w-4" />
                                          إضافة
                                        </>
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>

                            <Controller
                              name={`variants.${index}.variant_options`}
                              control={control}
                              render={({ field }) => {
                                const currentOptions = field.value || [];
                                const selectedOption = currentOptions.find(
                                  (opt) =>
                                    opt.option_value?.product_options?.id ===
                                    option.id,
                                );
                                const currentValue =
                                  selectedOption?.option_value?.value || "";

                                return (
                                  <Select
                                    value={currentValue}
                                    onValueChange={(value) => {
                                      const selectedValue =
                                        availableValues.find(
                                          (v) => v.value === value,
                                        );
                                      if (!selectedValue) return;

                                      const updatedValues =
                                        currentOptions.filter(
                                          (opt) =>
                                            opt.option_value?.product_options
                                              ?.id !== option.id,
                                        );

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

                                      field.onChange(updatedValues);
                                    }}
                                    disabled={isSubmitting}
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={`اختر ${option.name.toLowerCase()}`}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableValues.map((val) => (
                                        <SelectItem
                                          key={val.id}
                                          value={val.value}
                                        >
                                          {val.value}
                                        </SelectItem>
                                      ))}
                                      {availableValues.length === 0 && (
                                        <SelectItem value="no-values" disabled>
                                          لا توجد قيم متاحة
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                );
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {options.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        لا توجد خيارات متاحة.{" "}
                        <button
                          type="button"
                          onClick={() => setIsNewOptionDialogOpen(true)}
                          className="text-primary hover:underline"
                        >
                          أضف خيارًا جديدًا
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </FieldGroup>
          </CardContent>
        </Card>

        {/* --- زر الإرسال النهائي --- */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                إنشاء المنتج
              </>
            )}
          </Button>
        </div>
      </form>

      {/* --- Dialogs --- */}
      <DialogForm
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        activeDialog={activeDialog}
        setActiveDialog={setActiveDialog}
      />
    </>
  );
}

function DialogForm({
  isOpen,
  activeDialog,
  setActiveDialog,
  setIsOpen,
}: {
  isOpen: boolean;
  activeDialog: DialogState;
  setActiveDialog: (value: DialogState) => void;
  setIsOpen: (value: boolean) => void;
}) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setActiveDialog(null);
        }
        setIsOpen(isOpen);
      }}
    >
      {activeDialog === "category" ? (
        <CategoryForm
          closeDialog={() => {
            setIsOpen(false);
            setActiveDialog(null);
          }}
        />
      ) : activeDialog === "brand" ? (
        <BrandForm
          closeDialog={() => {
            setIsOpen(false);
            setActiveDialog(null);
          }}
        />
      ) : null}
    </Dialog>
  );
}
