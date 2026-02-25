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
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Trash2,
  Tag,
  CheckCircle,
  Plus,
  ListPlus,
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// --- استيرادات الأنواع ---
import { ProductFormData } from "@/lib/types/product";
import { createProduct } from "@/lib/actions/producta-add";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import CategoryForm from "./category-form";
import { useLocale } from "next-intl";
import VariantsForm from "./variants-form";
import { Category } from "@/lib/actions/category";
import { Brand } from "@/lib/actions/brands";
import {
  deleteProductOption,
  ProductOption,
} from "@/lib/actions/product-options";
import { ProductOptionValue } from "@/lib/actions/product-option-values";
import OptionsForm from "./options-form";
import BrandForm from "./brand-form";
import { nanoid } from "nanoid";
import { buildCategoryTree } from "@/lib/utils";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Separator } from "@/components/ui/separator";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BrandDialog from "./brand-dialog";
import DeleteBrandAlertDialog from "./brand-delete";
import CategoryDialog from "./category-dialog";
import DeleteCategoryAlertDialog from "./category-delete";

// =================================================================
// واجهة المكون (Props)
// =================================================================
interface AddProductFormProps {
  categories: Category[];
  brands: Brand[];
  options: ProductOption[];
  optionValues: ProductOptionValue[];
}

// =================================================================
// Dialog State
// =================================================================
type DialogState =
  | "BrandDialog"
  | "DeleteBrandDialog"
  | "CategoryDialog"
  | "DeleteCategoryDialog"
  | "category"
  | "brand"
  | "options"
  | "deleteOption"
  | "variants"
  | null;

const isRtlLocale = (locale: string) => {
  return ["ar", "fa", "he", "ur"].includes(locale);
};

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
  categories,
  brands,
  options,
  optionValues,
}: AddProductFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  const [tagsInput, setTagsInput] = useState("");

  //New Dialog State
  const [activeDialog, setActiveDialog] = useState<DialogState>(null);
  const [selcetedBrand, setSelcetedBrand] = useState<Brand | null>(null);
  const [selcetedCategory, setSelcetedCategory] = useState<Category | null>(
    null,
  );

  const [isOpen, setIsOpen] = useState(false);

  const [optionId, setOptionId] = useState<string>("");
  const [optionName, setOptionName] = useState<string>("");

  // Setting React Hook Form
  const {
    register,
    handleSubmit,
    control,
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

  const productName = useWatch({ control, name: "name" });
  const currentTags = useWatch({ control, name: "tags" }) || [];

  // const productName = useWatch({ name: "name" }) || "";
  // const currentTags = useWatch({ name: "tags" }) || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // --- تحديث الـ slug تلقائيًا (مع دعم العربية) ---
  useEffect(() => {
    if (productName) {
      const sku = generateSKU(productName);
      const slug = slugify(productName, {
        lower: true,
        strict: true,
        locale: "ar",
      });

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

  const categoryTree = buildCategoryTree(categories);

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

  const onCloseDialog = () => {
    setActiveDialog(null);
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
                  content="a detailed description of the product..."
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
                  {...register("main_image_url", {
                    required: "main image url is required.",
                    // pattern: {
                    //   value:
                    //     /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|svg))$/i,
                    //   message: "main image url must be a valid image URL.",
                    // },
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
                            // value={watch("image_urls")?.[index] || ""}
                            value={getValues("image_urls")?.[index] || ""}
                            onChange={(e) => {
                              // const currentUrls = watch("image_urls") || [];
                              const currentUrls = getValues("image_urls") || [];

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
                            // const currentUrls = watch("image_urls") || [];
                            const currentUrls = getValues("image_urls") || [];
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
                {/* Category */}

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Category</FieldLabel>
                    {selcetedCategory ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="icon-xs"
                          variant={"ghost"}
                          className="shrink-0"
                          onClick={() => {
                            setActiveDialog("CategoryDialog");
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>

                        <Button
                          type="button"
                          size="icon-xs"
                          variant={"ghost"}
                          className="shrink-0"
                          onClick={() => {
                            setActiveDialog("DeleteCategoryDialog");
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="icon-xs"
                        variant={"ghost"}
                        className="shrink-0"
                        onClick={() => {
                          setActiveDialog("CategoryDialog");
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* <Select onValueChange={(val) => setValue("category_id", val)}> */}
                  <Select
                    onValueChange={(val) => {
                      // إذا كانت القيمة فارغة، نقوم بمسح الحقل
                      if (val === "__clear__") {
                        setValue("category_id", "", { shouldValidate: true });
                        setSelcetedCategory(null);
                        console.error("selcetedCategory", selcetedCategory);
                        return;
                      }
                      // إذا كانت هناك قيمة، نقوم بتعيينها
                      setValue("category_id", val);
                      const category = categories.find((cat) => cat.id === val);
                      setSelcetedCategory(category || null);
                    }}
                    value={selcetedCategory?.id || ""} // التحكم في القيمة المعروضة
                  >
                    <SelectTrigger dir={dir} className="w-full">
                      <SelectValue
                        placeholder={
                          categoryTree.length > 0
                            ? "Select a Category"
                            : "No categories"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      <SelectItem value="__clear__">No Selected</SelectItem>

                      {categoryTree.map((categoryNode) => (
                        <SelectGroup key={categoryNode.id}>
                          {/* التصنيف الرئيسي */}
                          <SelectItem value={categoryNode.id}>
                            {categoryNode.name}
                          </SelectItem>
                          {/* التصنيفات الفرعية */}
                          {categoryNode.children.map((child) => (
                            <SelectItem
                              key={child.id}
                              value={child.id}
                              className="pl-6"
                            >
                              - {child.name} {/* أضف مسافة بادئة للتمييز */}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* brand */}

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Brand</FieldLabel>
                    {selcetedBrand ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="icon-xs"
                          variant={"ghost"}
                          className="shrink-0"
                          onClick={() => {
                            setActiveDialog("BrandDialog");
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>

                        <Button
                          type="button"
                          size="icon-xs"
                          variant={"ghost"}
                          className="shrink-0"
                          onClick={() => {
                            setActiveDialog("DeleteBrandDialog");
                          }}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="icon-xs"
                        variant={"ghost"}
                        className="shrink-0"
                        onClick={() => {
                          setActiveDialog("BrandDialog");
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <Select
                    onValueChange={(val) => {
                      // إذا كانت القيمة فارغة، نقوم بمسح الحقل
                      if (val === "__clear__") {
                        setValue("brand_id", "", { shouldValidate: true });
                        setSelcetedBrand(null);
                        return;
                      }
                      // إذا كانت هناك قيمة، نقوم بتعيينها
                      setValue("brand_id", val);
                      const brand = brands.find((bnd) => bnd.id === val);
                      setSelcetedBrand(brand || null);
                    }}
                    value={selcetedBrand?.id || ""} // التحكم في القيمة المعروضة
                  >
                    <SelectTrigger dir={dir}>
                      <SelectValue
                        placeholder={
                          brands.length > 0 ? "Select a Brand" : "No Brands"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent dir={dir}>
                      <SelectGroup>
                        {/* ✅ الخيار الأول: قيمة فارغة لإفراغ التحديد */}
                        <SelectItem value="__clear__">No Selected</SelectItem>

                        {brands.map((bnd) => (
                          <SelectItem key={bnd.id} value={bnd.id}>
                            {bnd.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
                    Add
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
                        setIsOpen(true);
                        setActiveDialog("options");
                      }}
                      disabled={isSubmitting}
                    >
                      <ListPlus className="mr-1 rtl:mr-auto rtl:ml-1 h-4 w-4" />
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
                                )}{" "}
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
                                  setOptionId(option.id);
                                  setOptionName(option.name);
                                  setIsOpen(true);
                                  setActiveDialog("variants");
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-xs"
                                variant={"ghost"}
                                className="shrink-0"
                                onClick={() => {
                                  setOptionId(option.id);
                                  setOptionName(option.name);
                                  setIsOpen(true);
                                  setActiveDialog("variants");
                                }}
                              >
                                <SquarePen className="h-3 w-3" />
                              </Button>
                              <DeleteProductOptionDialog
                                id={option.id}
                                name={option.name}
                              >
                                <Button
                                  type="button"
                                  size="icon-xs"
                                  variant={"ghost"}
                                  className="shrink-0"
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </DeleteProductOptionDialog>
                            </div>
                          </div>

                          <Controller
                            name={`variants.${index}.variant_options`}
                            control={control}
                            render={({ field }) => {
                              const currentOptions = field.value || [];

                              // Find the currently selected option for this specific product option ID
                              const selectedOption = currentOptions.find(
                                (opt) =>
                                  opt.option_value?.product_options?.id ===
                                  option.id,
                              );

                              const currentValue =
                                selectedOption?.option_value?.value || "";

                              return (
                                <Select
                                  dir={dir}
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

                                    // 3. Handle normal value selection
                                    const selectedValue = availableValues.find(
                                      (v) => v.value === value,
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
                                  <SelectContent dir={dir}>
                                    <SelectGroup>
                                      {/* Special item to clear selection (uses a non-empty string value) */}
                                      <SelectItem value="__clear__">
                                        No Selected
                                      </SelectItem>

                                      {availableValues.length > 0 ? (
                                        availableValues.map((val) => (
                                          <SelectItem
                                            key={val.id || val.value}
                                            value={val.value}
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
                          setIsOpen(true);
                          setActiveDialog("options");
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
        optionId={optionId}
        optionName={optionName}
        categories={categories}
      />

      {/* Brand Dialog */}
      <Dialog
        open={activeDialog === "BrandDialog"}
        onOpenChange={onCloseDialog}
      >
        <BrandDialog
          onClose={onCloseDialog}
          brand={selcetedBrand}
          className="lg:max-w-lg"
        />
      </Dialog>

      {/* Brand Delete Dialog */}
      <AlertDialog
        open={activeDialog === "DeleteBrandDialog"}
        onOpenChange={onCloseDialog}
      >
        <DeleteBrandAlertDialog
          onClose={onCloseDialog}
          brand={selcetedBrand}
          className="lg:max-w-lg"
        />
      </AlertDialog>

      {/* Category Dialog */}
      <Dialog
        open={activeDialog === "CategoryDialog"}
        onOpenChange={onCloseDialog}
      >
        <CategoryDialog
          onClose={onCloseDialog}
          category={selcetedCategory}
          categories={categories}
          className="lg:max-w-lg"
        />
      </Dialog>

      {/* Category Delete Dialog */}
      <AlertDialog
        open={activeDialog === "DeleteCategoryDialog"}
        onOpenChange={onCloseDialog}
      >
        <DeleteCategoryAlertDialog
          onClose={onCloseDialog}
          category={selcetedCategory}
          className="lg:max-w-lg"
        />
      </AlertDialog>
    </>
  );
}

function DialogForm({
  isOpen,
  activeDialog,
  setActiveDialog,
  setIsOpen,
  optionId,
  optionName,
  categories,
}: {
  isOpen: boolean;
  activeDialog: DialogState;
  setActiveDialog: (value: DialogState) => void;
  setIsOpen: (value: boolean) => void;
  optionId?: string;
  optionName?: string;
  categories?: Category[];
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
          categories={categories}
        />
      ) : activeDialog === "brand" ? (
        <BrandForm
          closeDialog={() => {
            setIsOpen(false);
            setActiveDialog(null);
          }}
        />
      ) : activeDialog === "options" ? (
        <OptionsForm
          closeDialog={() => {
            setIsOpen(false);
            setActiveDialog(null);
          }}
        />
      ) : activeDialog === "variants" ? (
        <VariantsForm
          optionId={optionId}
          optionName={optionName}
          closeDialog={() => {
            setIsOpen(false);
            setActiveDialog(null);
          }}
        />
      ) : null}
    </Dialog>
  );
}

// Delete Product Option

function DeleteProductOptionDialog({
  children,
  id,
  name,
}: {
  children: React.ReactNode;
  id: string;
  name: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    const { error } = await deleteProductOption(id);

    if (error) {
      toast.error(error);
      setIsLoading(false);
      return;
    }

    toast.success("Option deleted successfully.");
    setIsLoading(false);
    router.refresh();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            option <b>{name}</b> and remove it from all products.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={"destructive"} onClick={handleDelete}>
            {isLoading ? <Spinner /> : "Delete Option"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
