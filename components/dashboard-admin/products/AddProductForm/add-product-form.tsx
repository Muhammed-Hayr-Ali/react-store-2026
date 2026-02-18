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
  PlusCircle,
  Image,
  Tag,
  CheckCircle,
  X,
  Plus,
  FolderPlus,
  Store,
  Palette,
  ListPlus,
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
import { createCategory } from "@/lib/actions/categories";
// ⚠️ تأكد من وجود هذين الملفين في lib/actions/
import { createProductOption } from "@/lib/actions/product-options";
import { createProductOptionValue } from "@/lib/actions/product-option-values";

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

  // حالة النوافذ المنبثقة للإضافة السريعة
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);

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

  // --- إدارة مصفوفة المتغيرات الديناميكية ---
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

  // --- ✅ إضافة تصنيف جديد سريع ---
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("يرجى إدخال اسم التصنيف");
      return;
    }

    setIsCreatingCategory(true);
    try {
      const result = await createCategory({
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName.trim(), { lower: true, locale: "ar" }),
      });

      if (result.success && result.categoryId) {
        toast.success("تم إضافة التصنيف بنجاح");
        setValue("category_id", result.categoryId);
        setNewCategoryName("");
        setIsCategoryDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "فشل إضافة التصنيف");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("حدث خطأ أثناء إضافة التصنيف");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // --- ✅ إضافة علامة تجارية جديدة سريعة ---
  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error("يرجى إدخال اسم العلامة التجارية");
      return;
    }

    setIsCreatingBrand(true);
    try {
      const result = await createBrand({
        name: newBrandName.trim(),
        slug: slugify(newBrandName.trim(), { lower: true, locale: "ar" }),
      });

      if (result.success && result.brandId) {
        toast.success("تم إضافة العلامة التجارية بنجاح");
        setValue("brand_id", result.brandId);
        setNewBrandName("");
        setIsBrandDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "فشل إضافة العلامة التجارية");
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error("حدث خطأ أثناء إضافة العلامة التجارية");
    } finally {
      setIsCreatingBrand(false);
    }
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* --- القسم 1: المعلومات الأساسية --- */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">اسم المنتج *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "اسم المنتج مطلوب.",
                  minLength: {
                    value: 3,
                    message: "يجب أن يكون الاسم 3 أحرف على الأقل.",
                  },
                })}
                disabled={isSubmitting}
                placeholder="مثال: هاتف ذكي V10"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="slug">رابط URL *</Label>
              <Input
                id="slug"
                {...register("slug", {
                  required: "الرابط مطلوب.",
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message:
                      "يجب أن يحتوي الرابط على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.",
                  },
                })}
                disabled={isSubmitting}
                placeholder="e.g., smartphone-v10"
              />
              {errors.slug && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="short_description">وصف مختصر</Label>
            <Textarea
              id="short_description"
              {...register("short_description")}
              disabled={isSubmitting}
              placeholder="وصف موجز يظهر في قوائم المنتجات..."
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">الوصف الكامل *</Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "الوصف الكامل مطلوب.",
                minLength: {
                  value: 10,
                  message: "يجب أن يكون الوصف 10 أحرف على الأقل.",
                },
              })}
              disabled={isSubmitting}
              placeholder="وصف تفصيلي للمنتج..."
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
            الوسائط
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="main_image_url">رابط الصورة الرئيسية</Label>
            <Input
              id="main_image_url"
              {...register("main_image_url")}
              disabled={isSubmitting}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-1">
            <Label>روابط صور إضافية</Label>
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
                    field.onChange(urls.length > 0 ? urls : []);
                  }}
                  disabled={isSubmitting}
                  placeholder="أدخل رابطًا واحدًا في كل سطر..."
                  rows={4}
                />
              )}
            />
            <p className="text-sm text-muted-foreground">
              أضف صورًا متعددة، واحدًا في كل سطر
            </p>
          </div>
        </CardContent>
      </Card>

      {/* --- القسم 3: التصنيفات والعلامات --- */}
      <Card>
        <CardHeader>
          <CardTitle>التصنيفات والعلامات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* التصنيف */}
          <div className="space-y-1">
            <Label>التصنيف</Label>
            <div className="flex gap-2">
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val === "" ? null : val)
                    }
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر تصنيفًا" />
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
              <Dialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isSubmitting}
                    title="إضافة تصنيف جديد"
                    className="shrink-0"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة تصنيف جديد</DialogTitle>
                    <DialogDescription>
                      أضف تصنيفًا جديدًا ليظهر في القائمة
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-category">اسم التصنيف</Label>
                      <Input
                        id="new-category"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="مثال: إلكترونيات"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCreateCategory();
                          }
                        }}
                        disabled={isCreatingCategory}
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
                      onClick={handleCreateCategory}
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                    >
                      {isCreatingCategory ? (
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
          </div>

          {/* العلامة التجارية */}
          <div className="space-y-1">
            <Label>العلامة التجارية</Label>
            <div className="flex gap-2">
              <Controller
                name="brand_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val === "" ? null : val)
                    }
                    value={field.value ?? ""}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="اختر علامة تجارية" />
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
              <Dialog
                open={isBrandDialogOpen}
                onOpenChange={setIsBrandDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isSubmitting}
                    title="إضافة علامة تجارية جديدة"
                    className="shrink-0"
                  >
                    <Store className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة علامة تجارية جديدة</DialogTitle>
                    <DialogDescription>
                      أضف علامة تجارية جديدة لتظهر في القائمة
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-brand">اسم العلامة التجارية</Label>
                      <Input
                        id="new-brand"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="مثال: سامسونج"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCreateBrand();
                          }
                        }}
                        disabled={isCreatingBrand}
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
                      onClick={handleCreateBrand}
                      disabled={isCreatingBrand || !newBrandName.trim()}
                    >
                      {isCreatingBrand ? (
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
          </div>

          {/* الوسوم */}
          <div className="space-y-2">
            <Label>الوسوم (Tags)</Label>
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
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-red-500"
                    aria-label={`إزالة الوسم ${tag}`}
                  >
                    <X className="h-3 w-3" />
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
          <CardTitle>الإعدادات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_available">متاح للبيع</Label>
              <p className="text-sm text-muted-foreground">
                جعل هذا المنتج متاحًا في المتجر
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
              <Label htmlFor="is_featured">منتج مميز</Label>
              <p className="text-sm text-muted-foreground">
                عرض هذا المنتج في الأقسام المميزة
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
          <CardTitle>المتغيرات والأسعار</CardTitle>
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
            <PlusCircle className="mr-2 h-4 w-4" /> إضافة متغير
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
                        onCheckedChange={(checked) =>
                          handleDefaultVariantChange(index, !!checked)
                        }
                        disabled={isSubmitting}
                      />
                      <Label htmlFor={`default-${index}`} className="text-sm">
                        المتغير الافتراضي
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
                      required: "SKU مطلوب.",
                    })}
                    placeholder="مثال: SPV10-BLK"
                    disabled={isSubmitting}
                  />
                  {errors.variants?.[index]?.sku && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.variants?.[index]?.sku?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>الكمية في المخزن *</Label>
                  <Input
                    type="number"
                    {...register(`variants.${index}.stock_quantity`, {
                      valueAsNumber: true,
                      required: "الكمية مطلوبة.",
                      min: {
                        value: 0,
                        message: "يجب أن تكون الكمية رقمًا موجبًا.",
                      },
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
                  <Label>السعر *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`variants.${index}.price`, {
                      valueAsNumber: true,
                      required: "السعر مطلوب.",
                      min: { value: 0, message: "يجب أن يكون السعر موجبًا." },
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
                  <Label>سعر الخصم</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`variants.${index}.discount_price`, {
                      valueAsNumber: true,
                      min: { value: 0, message: "يجب أن يكون الخصم موجبًا." },
                    })}
                    disabled={isSubmitting}
                    placeholder="اختياري"
                  />
                </div>

                <div className="space-y-1">
                  <Label>ينتهي الخصم في</Label>
                  <Input
                    type="datetime-local"
                    {...register(`variants.${index}.discount_expires_at`)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1">
                  <Label>رابط صورة المتغير</Label>
                  <Input
                    {...register(`variants.${index}.image_url`)}
                    placeholder="https://example.com/variant.jpg"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* ✅ خيارات المتغير مع أزرار الإضافة الديناميكية */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <Label className="block">الخيارات (مثل اللون، المقاس)</Label>

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
                        <DialogDescription>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-option-name">اسم الخيار</Label>
                          <Input
                            id="new-option-name"
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
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
                          disabled={isCreatingOption || !newOptionName.trim()}
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
                                <DialogDescription>
                                </DialogDescription>
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
                                  const selectedValue = availableValues.find(
                                    (v) => v.value === value,
                                  );
                                  if (!selectedValue) return;

                                  const updatedValues = currentOptions.filter(
                                    (opt) =>
                                      opt.option_value?.product_options?.id !==
                                      option.id,
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
                                    <SelectItem key={val.id} value={val.value}>
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

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                  onClick={() => remove(index)}
                  disabled={isSubmitting}
                  aria-label="حذف المتغير"
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
  );
}
