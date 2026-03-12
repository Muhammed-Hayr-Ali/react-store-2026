import { getCategories } from "@/lib/actions/category"; // دالة لجلب كل الفئات
import { getBrands } from "@/lib/actions/brands"; // دالة لجلب كل العلامات التجارية
import { getProductById } from "@/lib/actions/products-manager";
import { getProductOptions } from "@/lib/actions/product-options";
import { getProductOptionValues } from "@/lib/actions/product-option-values";
import { AddProductForm } from "@/components/dashboard/products/AddProductForm/add-product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;

  // جلب البيانات بشكل متوازٍ لتحسين الأداء
  const [productResult, categories, brands, options, optionValues] =
    await Promise.all([
      getProductById(productId),
      getCategories(), // افترض أن هذه الدوال موجودة
      getBrands(),
      getProductOptions(),
      getProductOptionValues(),
    ]);

  // التعامل مع حالة عدم العثور على المنتج
  if (productResult.error || !productResult.data) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground">{productResult.error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Edit Product: {productResult.data.name}
      </h1>

      {/* تمرير بيانات المنتج إلى النموذج */}
      <AddProductForm
        product={productResult.data} // <<-- هنا نمرر المنتج للتحرير
        categories={categories.data || []}
        brands={brands.data || []}
        options={options.data || []}
        optionValues={optionValues.data || []}
      />
    </div>
  );
}
